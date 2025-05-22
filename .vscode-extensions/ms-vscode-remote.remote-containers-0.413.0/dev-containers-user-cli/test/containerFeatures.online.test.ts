import * as path from 'path';
import { getPackageConfig } from '../../src/node/utils';
import { removeImage } from '../../test/core/testUtils';
import { buildImage, runDockerCommandAgainstImage } from './helpers';

const rootFolder = path.join('test', 'example-projects');

describe('Using remote container-features with devcontainer user CLI', function () {
	this.timeout(1 * 60 * 1000);

	const pkgPath = path.join(__dirname, '..');
	let pkgTgz: string;
	before(async () => {
		const pkgConfig = await getPackageConfig(pkgPath);
		pkgTgz = `vscode-dev-container-cli-${pkgConfig.version}.tgz`;
	});

	describe(`build github-and-local-cache-dockerfile and run installed features`, () => {
		const project = 'github-and-local-cache-dockerfile';
		const definitionPath = path.join(rootFolder, project);
		const imageName = `devcontainer-cli-${project.toLowerCase()}`;

		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage(project, pkgTgz, definitionPath, imageName, true, true);  
		});

		it('docker run to confirm image has all programs installed by features', async function () {
			this.slow(120000);
			this.timeout(120000);

			await runDockerCommandAgainstImage(imageName, ['gh']);
			await runDockerCommandAgainstImage(imageName, ['hello']);
			await runDockerCommandAgainstImage(imageName, ['hello2']);

			// await runInContainer(project, pkgTgz, definitionPath, imageName, ['gh']);
			// await runInContainer(project, pkgTgz, definitionPath, imageName, ['hello']);
			// await runInContainer(project, pkgTgz, definitionPath, imageName, ['hello2']);

			await removeImage(imageName);
		});
	});

	describe.skip(`build direct-tar-dockerfile and run installed feature`, () => {
		const project = 'direct-tar-dockerfile';
		const definitionPath = path.join(rootFolder, project);
		const imageName = `devcontainer-cli-${project.toLowerCase()}`;

		it('should build with CLI', async function () {
			this.slow(120000);
			this.timeout(120000);
			await buildImage(project, pkgTgz, definitionPath, imageName, true, true);  
		});

		it('docker run to confirm image has program installed by feature', async function () {
			this.slow(120000);
			this.timeout(120000);

			await runDockerCommandAgainstImage(imageName, ['hello']);
			await removeImage(imageName);
		});	
	});

	// describe(`build private-github-dockerfile and run installed feature`, () => {
	// 	const project = 'private-github-dockerfile';
	// 	const definitionPath = path.join(rootFolder, project);
	//     const imageName = `devcontainer-cli-${project.toLowerCase()}`;

	// 	it('should build with CLI', async function () {
	// 		this.slow(120000);
	// 		this.timeout(120000);
	// 		await buildImage(project, pkgTgz, definitionPath, imageName, true, true);  
	// 	});

	//     it('docker run to confirm image has program installed by feature', async function () {
	// 		this.slow(120000);
	// 		this.timeout(120000);

	// 		await runDockerCommandAgainstImage(imageName, ['hello']);
	//         await removeImage(imageName);
	//     });	
	// });
});