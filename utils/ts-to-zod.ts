import pLimit from "p-limit";
import {LIMIT_PROCESS_GEN_ZOD_FILE} from './constants';
import { exec } from "child_process";

const limitProcess = pLimit(LIMIT_PROCESS_GEN_ZOD_FILE); // Limit process

export const runTsToZod = async (files: string[]) => {
    try {
        const tasks = files.map((file) =>
            limitProcess(() => {
              return new Promise((resolve, reject) => {
                const outputFile = file.replace(".ts", ".zod.ts");
        
                exec(`npx ts-to-zod ${file} ${outputFile}`, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`❌ Error converting ${file}:\n${stderr}`);
                    reject(error);
                  } else {
                    console.log(`✅ Converted ${file} to ${outputFile}`);
                    resolve(stdout);
                  }
                });
              });
            })
        );
        
        await Promise.allSettled(tasks); // Run all task with limit
    } catch(err) {
        console.log('❌ Error when run process ts to zod', err.message);
    }
};