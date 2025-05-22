/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getPackageConfig } from '../../src/node/utils';
import { getRepoTempFolder, verifyRepoIsCloned } from '../../test/dev-containers/src/containerTestUtils';
import { exec as shellExec} from '../../test/core/testUtils';
import { buildImage, ensureFolderExists, spawnAndWait } from './helpers';

const rootFolder = getRepoTempFolder();
ensureFolderExists(rootFolder);

const tryFolder = path.join(getRepoTempFolder(), 'vscode-remote-try');
ensureFolderExists(tryFolder);
verifyRepoIsCloned('vscode-remote-try-node', tryFolder);
verifyRepoIsCloned('vscode-remote-try-go', tryFolder);


describe('With devcontainer user CLI', function () {
	this.timeout(1 * 60 * 1000);

	const pkgPath = path.join(__dirname, '..');
	let pkgTgz: string;
	before(async () => {
		const pkgConfig = await getPackageConfig(pkgPath);
		pkgTgz = `vscode-dev-container-cli-${pkgConfig.version}.tgz`;
	});

	it('Should show help', async () => {

		const result = await shellExec([
			'npx',
			pkgTgz,
			'--help',
		].join(' '));

		assert.strictEqual(result.error, null);
		assert.match(result.stdout, new RegExp('  devcontainer build'), 'help should include build command');
		assert.match(result.stdout, new RegExp('  devcontainer '), 'help should include run command');
		assert.doesNotMatch(result.stdout, new RegExp('  devcontainer open'), 'help for standalone CLI should not include open command');
	});

	describe(`build (Dockerfile): vscode-remote-try/vscode-remote-try-node`, () => {
		const project = 'vscode-remote-try/vscode-remote-try-node';
		const definitionPath = path.join(rootFolder, project);

		const projectName = project.substring(project.lastIndexOf('/') + 1);
		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage(projectName, pkgTgz, definitionPath);
		});

		it('should build with CLI and --no-cache', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage(projectName, pkgTgz, definitionPath, undefined, undefined, undefined, true);
		});
	});

	describe(`build (docker-compose): javascript-node-mongo`, () => {
		const project = 'javascript-node-mongo';
		const definitionPath = path.join(rootFolder, project);

		const projectName = project.substring(project.lastIndexOf('/') + 1);
		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			ensureFolderExists(definitionPath);
			await spawnAndWait('npx', [pkgTgz, 'templates', 'apply', '--workspace-folder', definitionPath, '--template-id', 'ghcr.io/devcontainers/templates/javascript-node-mongo:latest']);
			await buildImage(projectName, pkgTgz, definitionPath);
		});
	});

	describe('build (image): mcr.microsoft.com/vscode/devcontainers/typescript-node:0-12', () => {
		const imageName = 'mcr.microsoft.com/vscode/devcontainers/typescript-node:0-12';
		let testDir = '';

		before(() => {
			testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-containers-user-cli-build-image'));
			fs.mkdirSync(path.join(testDir, '.devcontainer'));
			fs.writeFileSync(path.join(testDir, '.devcontainer', 'devcontainer.json'), `{"image":"${imageName}"}`);
		});
		after(() => {
			fs.rmdirSync(testDir, { recursive: true });
		});

		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage('image-build-test', pkgTgz, testDir, imageName);
		});

	});

	describe(`build vscode-remote-try/vscode-remote-try-go`, () => {
		const project = 'vscode-remote-try/vscode-remote-try-go';
		const definitionPath = path.join(rootFolder, project);

		// build the dev container image, then run a `go build` command in an instance of the dev container
		const projectName = project.substring(project.lastIndexOf('/') + 1);
		const imageName = `devcontainer-cli-${projectName.toLowerCase()}`;
		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			const retainImage = true;
			await buildImage(projectName, pkgTgz, definitionPath, imageName, retainImage);
		});
	});

});
