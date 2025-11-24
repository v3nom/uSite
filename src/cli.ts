#!/usr/bin/env node
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import uSite from './usite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2];
const param = process.argv[3];

const run = async () => {
    if (command === 'generate') {
        if (!param) {
            console.error('Filename is required when calling generate. Example: "usite generate blog"');
            return;
        }

        const generatorPath = path.resolve(process.cwd(), param);
        if (!fs.existsSync(generatorPath)) {
            console.error(`Generator file not found: ${generatorPath}`);
            return;
        }

        try {
            const generator = await import(generatorPath);
            if (!generator.generate) {
                console.error("Provided generator is missing generate function");
                return;
            }
            generator.generate(uSite);
        } catch (e) {
            console.error("Error loading generator:", e);
        }
    } else if (command === 'init') {
        const templatePath = path.resolve(__dirname, '../templates/default');
        const workingDirectory = process.cwd();

        if (!fs.existsSync(templatePath)) {
            console.error("Default template not found at " + templatePath);
            return;
        }

        console.log("Initializing uSite project...");
        try {
            fs.copySync(templatePath, workingDirectory, { overwrite: false });
            console.log("uSite project initialized successfully!");
        } catch (err) {
            console.error("Error initializing project:", err);
        }
    } else {
        console.log("Usage: usite [init|generate <file>]");
    }
};

run();
