import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CLI Integration Tests', () => {
    let tempDir: string;
    let cliPath: string;

    // Ensure project is built before running any CLI tests
    beforeAll(() => {
        cliPath = path.resolve(__dirname, '../dist/cli.js');
        if (!fs.existsSync(cliPath)) {
            throw new Error(
                'Build required: dist/cli.js not found. Run "npm run build" before running tests.\\n' +
                'In CI, this is handled automatically by running "npm run build" before "npm test".'
            );
        }
    });

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usite-test-'));
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.removeSync(tempDir);
        }
    });

    describe('Package Distribution', () => {
        it('should have executable shebang in CLI file', () => {
            const content = fs.readFileSync(cliPath, 'utf-8');
            expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
        });

        it('should include templates directory in package files', () => {
            const packageJsonPath = path.resolve(__dirname, '../package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            expect(packageJson.files).toContain('templates');
            expect(packageJson.files).toContain('dist');
        });

        it('should have bin entry pointing to dist/cli.js', () => {
            const packageJsonPath = path.resolve(__dirname, '../package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            expect(packageJson.bin).toBeDefined();
            expect(packageJson.bin.uSite).toBe('./dist/cli.js');
        });

        it('should have all required template files', () => {
            const templatePath = path.resolve(__dirname, '../templates/default');

            expect(fs.existsSync(templatePath)).toBe(true);
            expect(fs.existsSync(path.join(templatePath, 'blog.js'))).toBe(true);
            expect(fs.existsSync(path.join(templatePath, 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join(templatePath, 'website.json'))).toBe(true);
        });
    });

    describe('CLI init command', () => {
        it('should copy template files to current directory', () => {
            execSync(`node "${cliPath}" init`, { cwd: tempDir });

            expect(fs.existsSync(path.join(tempDir, 'blog.js'))).toBe(true);
            expect(fs.existsSync(path.join(tempDir, 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join(tempDir, 'website.json'))).toBe(true);
        });

        it('should not overwrite existing files', () => {
            const testFile = path.join(tempDir, 'blog.js');
            const originalContent = '// My custom blog';
            fs.writeFileSync(testFile, originalContent);

            execSync(`node "${cliPath}" init`, { cwd: tempDir });

            const content = fs.readFileSync(testFile, 'utf-8');
            expect(content).toBe(originalContent);
        });

        it('should handle missing template directory gracefully', () => {
            const templatesPath = path.resolve(__dirname, '../templates');
            const tempTemplatesPath = path.resolve(__dirname, '../templates-backup');

            if (fs.existsSync(templatesPath)) {
                fs.renameSync(templatesPath, tempTemplatesPath);
            }

            try {
                execSync(`node "${cliPath}" init`, {
                    cwd: tempDir,
                    encoding: 'utf-8',
                    stdio: 'pipe'
                });
                expect(true).toBe(false);
            } catch (error: any) {
                const output = error.stderr || error.stdout || error.message || '';
                expect(output).toContain('template not found');
            } finally {
                if (fs.existsSync(tempTemplatesPath)) {
                    fs.renameSync(tempTemplatesPath, templatesPath);
                }
            }
        });
    });

    describe('CLI generate command', () => {
        it('should require a filename parameter', () => {
            try {
                execSync(`node "${cliPath}" generate`, {
                    cwd: tempDir,
                    encoding: 'utf-8',
                    stdio: 'pipe'
                });
                expect(true).toBe(false);
            } catch (error: any) {
                const output = error.stderr || error.stdout || error.message || '';
                expect(output).toContain('Filename is required');
            }
        });

        it('should error when generator file does not exist', () => {
            try {
                execSync(`node "${cliPath}" generate nonexistent.js`, {
                    cwd: tempDir,
                    encoding: 'utf-8',
                    stdio: 'pipe'
                });
                expect(true).toBe(false);
            } catch (error: any) {
                const output = error.stderr || error.stdout || error.message || '';
                expect(output).toContain('not found');
            }
        });

        it('should error when generator is missing generate function', () => {
            const generatorPath = path.join(tempDir, 'invalid.js');
            fs.writeFileSync(generatorPath, 'export const notGenerate = () => {};');

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

        it('should execute valid generator file', () => {
            const generatorPath = path.join(tempDir, 'test-generator.js');
            const testOutputPath = path.join(tempDir, 'output.txt');

            fs.writeFileSync(generatorPath, `
                import fs from 'fs';
                export function generate(uSite) {
                    fs.writeFileSync('${testOutputPath}', 'Generator executed successfully');
                }
            `);

            execSync(`node "${cliPath}" generate test-generator.js`, {
                cwd: tempDir,
                encoding: 'utf-8'
            });

            expect(fs.existsSync(testOutputPath)).toBe(true);
            const content = fs.readFileSync(testOutputPath, 'utf-8');
            expect(content).toBe('Generator executed successfully');
        });
    });

    describe('CLI help and usage', () => {
        it('should display usage when no command is provided', () => {
            const result = execSync(`node "${cliPath}"`, {
                cwd: tempDir,
                encoding: 'utf-8'
            });

            expect(result).toContain('Usage:');
            expect(result).toContain('init');
            expect(result).toContain('generate');
        });

        it('should display usage for unknown command', () => {
            const result = execSync(`node "${cliPath}" unknown`, {
                cwd: tempDir,
                encoding: 'utf-8'
            });

            expect(result).toContain('Usage:');
        });
    });
});
