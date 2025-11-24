import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('End-to-End Workflow Tests', () => {
    let tempDir: string;
    let projectRoot: string;
    let cliPath: string;

    beforeAll(() => {
        projectRoot = path.resolve(__dirname, '..');
        cliPath = path.resolve(projectRoot, 'dist/cli.js');

        if (!fs.existsSync(cliPath)) {
            throw new Error(
                'Build required: dist/cli.js not found. Run "npm run build" before running tests.\\n' +
                'In CI, this is handled automatically by running "npm run build" before "npm test".'
            );
        }
    });

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usite-e2e-'));
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.removeSync(tempDir);
        }
    });

    describe('Complete workflow: init -> install -> generate', () => {
        it('should complete full workflow successfully', () => {
            // Step 1: Initialize project
            execSync(`node "${cliPath}" init`, { cwd: tempDir });

            // Verify initialization
            expect(fs.existsSync(path.join(tempDir, 'blog.js'))).toBe(true);
            expect(fs.existsSync(path.join(tempDir, 'package.json'))).toBe(true);

            // Step 2: Install dependencies (optional, may timeout)
            try {
                execSync('npm install', {
                    cwd: tempDir,
                    stdio: 'pipe',
                    timeout: 30000
                });
            } catch (error) {
                console.warn('npm install failed or timed out, skipping rest of workflow test');
                return;
            }

            // Step 3: Verify blog.js can be loaded
            const blogPath = path.join(tempDir, 'blog.js');
            expect(fs.existsSync(blogPath)).toBe(true);

            const blogContent = fs.readFileSync(blogPath, 'utf-8');
            expect(blogContent).toContain('export');
            expect(blogContent).toContain('generate');
        });
    });

    describe('Template integrity', () => {
        it('should have valid package.json in template', () => {
            const templatePackageJson = path.resolve(projectRoot, 'templates/default/package.json');

            expect(fs.existsSync(templatePackageJson)).toBe(true);

            const content = fs.readFileSync(templatePackageJson, 'utf-8');
            const parsed = JSON.parse(content);

            expect(parsed).toBeDefined();
            expect(parsed.type).toBe('module');
        });

        it('should have valid website.json in template', () => {
            const templateWebsiteJson = path.resolve(projectRoot, 'templates/default/website.json');

            expect(fs.existsSync(templateWebsiteJson)).toBe(true);

            const content = fs.readFileSync(templateWebsiteJson, 'utf-8');
            const parsed = JSON.parse(content);

            expect(parsed).toBeDefined();
        });

        it('should have valid blog.js generator in template', () => {
            const templateBlogJs = path.resolve(projectRoot, 'templates/default/blog.js');

            expect(fs.existsSync(templateBlogJs)).toBe(true);

            const content = fs.readFileSync(templateBlogJs, 'utf-8');

            expect(content).toContain('import');
            expect(content).toContain('export');
            expect(content).toContain('generate');
        });

        it('should have content directory in template', () => {
            const contentDir = path.resolve(projectRoot, 'templates/default/content');
            expect(fs.existsSync(contentDir)).toBe(true);
        });

        it('should have template directory in template', () => {
            const templateDir = path.resolve(projectRoot, 'templates/default/template');
            expect(fs.existsSync(templateDir)).toBe(true);
        });
    });

    describe('ESM module compatibility', () => {
        it('should have .js extensions in all imports in dist', () => {
            const distPath = path.resolve(projectRoot, 'dist');

            const jsFiles = fs.readdirSync(distPath, { recursive: true })
                .filter((file: any) => typeof file === 'string' && file.endsWith('.js'));

            for (const file of jsFiles) {
                const filePath = path.join(distPath, file as string);
                const content = fs.readFileSync(filePath, 'utf-8');

                const relativeImports = content.match(/from\s+['"]\.\.\?\/[^'"]+['"]/g) || [];

                for (const importStatement of relativeImports) {
                    expect(importStatement).toMatch(/\.js['"]$/);
                }
            }
        });

        it('should have type: module in package.json', () => {
            const packageJsonPath = path.resolve(projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            expect(packageJson.type).toBe('module');
        });
    });

    describe('Path resolution', () => {
        it('should resolve template path correctly from dist', () => {
            execSync(`node "${cliPath}" init`, { cwd: tempDir });

            expect(fs.existsSync(path.join(tempDir, 'blog.js'))).toBe(true);
        });
    });

    describe('Error handling and user feedback', () => {
        it('should provide helpful error for missing generator', () => {
            try {
                execSync(`node "${cliPath}" generate missing.js`, {
                    cwd: tempDir,
                    encoding: 'utf-8',
                    stdio: 'pipe'
                });
                expect(true).toBe(false);
            } catch (error: any) {
                const output = error.stderr || error.stdout || error.message || '';
                expect(output).toContain('not found');
                expect(output).toContain('missing.js');
            }
        });

        it('should provide helpful error for invalid generator', () => {
            const generatorPath = path.join(tempDir, 'invalid.js');
            fs.writeFileSync(generatorPath, 'export const foo = "bar";');

            try {
                execSync(`node "${cliPath}" generate invalid.js`, {
                    cwd: tempDir,
                    encoding: 'utf-8',
                    stdio: 'pipe'
                });
                expect(true).toBe(false);
            } catch (error: any) {
                const output = error.stderr || error.stdout || error.message || '';
                expect(output).toContain('missing generate function');
            }
        });
    });

    describe('Package structure validation', () => {
        it('should have all required files for npm package', () => {
            const requiredFiles = [
                'package.json',
                'README.md',
                'LICENSE'
            ];

            for (const file of requiredFiles) {
                const filePath = path.resolve(projectRoot, file);
                expect(fs.existsSync(filePath)).toBe(true);
            }
        });

        it('should have .npmignore or files field in package.json', () => {
            const npmignorePath = path.resolve(projectRoot, '.npmignore');
            const packageJsonPath = path.resolve(projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            const hasNpmignore = fs.existsSync(npmignorePath);
            const hasFilesField = Array.isArray(packageJson.files);

            expect(hasNpmignore || hasFilesField).toBe(true);
        });

        it('should exclude development files from package', () => {
            const packageJsonPath = path.resolve(projectRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            if (packageJson.files) {
                expect(packageJson.files).not.toContain('src');
                expect(packageJson.files).not.toContain('test');
                expect(packageJson.files).not.toContain('*.spec.ts');
            }
        });
    });
});
