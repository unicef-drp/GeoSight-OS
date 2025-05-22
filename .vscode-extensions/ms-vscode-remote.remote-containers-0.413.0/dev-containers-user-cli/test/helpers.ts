/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as fs from 'fs';
import {  imageExists, removeImage } from '../../test/core/testUtils';
import { spawn } from 'child_process';
import { findLocalWindowsExecutable } from '../../src/common/windowsExec';

export async function buildImage(projectName: string, pkgTgz: string, definitionPath: string, imageName?: string, retainImage?: boolean, verbose?: boolean, noCache?: boolean) {
	if (!imageName) {
		imageName = `devcontainer-cli-${projectName.toLowerCase()}`;
	}

	if (await imageExists(imageName)) {
		await removeImage(imageName);
	}

	let args = [
		pkgTgz,
		'build',
		definitionPath,
		'--image-name',
		imageName!
	];

	if (verbose) {
		args.push('--verbose');
	}

	if (noCache) {
		args.push('--no-cache');
	}

	try {
		const result = await spawnAndWait('npx', args);
		assert.strictEqual(result.code, 0, 'Expect zero exit code');
	} catch (error) {
		console.log('Error thrown');
		console.log(error);
		assert.fail('Error thrown');
	}

	const imageBuilt = await imageExists(imageName);
	if (imageBuilt) {
		if (!retainImage) {
			await removeImage(imageName);
		}
	} else {
		assert.fail(`Image '${imageName}' not found after build`);
	}
}

export async function runDockerCommandAgainstImage(imageName: string, cmd: string[]) {
	try {
		const result = await spawnAndWait('docker', [
			'run',
			'--rm',
			imageName,
			...cmd
		]);
		assert.strictEqual(result.code, 0, 'Expect zero exit code');
	} catch (error) {
		console.log('Error thrown');
		console.log(error);
		assert.fail('Error thrown');
	}	
}


export function ensureFolderExists(folder: string) {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
}
export function deleteFileIfExists(file: string) {
	if (fs.existsSync(file)) {
		fs.rmSync(file);
	}
}
export async function spawnAndWait(command: string, args: string[]) {
	const exec = await findLocalWindowsExecutable(command);
	return new Promise<{ code: number | null; hasStdErr: boolean | null }>((resolve) => {
        console.log(`args: ${args.join(' ')}`);
		let hasStdErr = false;
		const spawnedProcess = spawn(exec, args, { shell: true /* shell avoids ENOENT on Windows*/ });
		spawnedProcess.stdout.on('data', (data) => {
			process.stdout.write(data);
		});

		spawnedProcess.stderr.on('data', (data) => {
			process.stderr.write(data);
			hasStdErr = true;
		});

		spawnedProcess.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
			resolve({ code, hasStdErr });
		});
	});
}