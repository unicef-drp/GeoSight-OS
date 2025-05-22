/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/


import * as path from 'path';
import { getPackageConfig } from '../../src/node/utils';
import { buildImage } from './helpers';

const rootFolder = path.join('test', 'example-projects');

describe('Using container-features with devcontainer user CLI', function () {
	this.timeout(1 * 60 * 1000);

	const pkgPath = path.join(__dirname, '..');
	let pkgTgz: string;
	before(async () => {
		const pkgConfig = await getPackageConfig(pkgPath);
		pkgTgz = `vscode-dev-container-cli-${pkgConfig.version}.tgz`;
	});

	describe(`build local-cache-dockerfile and run installed feature`, () => {
		const project = 'local-cache-dockerfile';
		const definitionPath = path.join(rootFolder, project);
        const imageName = `devcontainer-cli-${project.toLowerCase()}`;

		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage(project, pkgTgz, definitionPath, imageName, true, true);  
		});
	});
});