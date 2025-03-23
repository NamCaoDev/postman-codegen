"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTsToZod = void 0;
const p_limit_1 = __importDefault(require("p-limit"));
const constants_1 = require("./constants");
const child_process_1 = require("child_process");
const limitProcess = (0, p_limit_1.default)(constants_1.LIMIT_PROCESS_GEN_ZOD_FILE); // Limit process
const runTsToZod = (files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = files.map((file) => limitProcess(() => {
            return new Promise((resolve, reject) => {
                const outputFile = file.replace(".ts", ".zod.ts");
                (0, child_process_1.exec)(`npx ts-to-zod ${file} ${outputFile}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ Error converting ${file}:\n${stderr}`);
                        reject(error);
                    }
                    else {
                        console.log(`✅ Converted ${file} to ${outputFile}`);
                        resolve(stdout);
                    }
                });
            });
        }));
        yield Promise.allSettled(tasks); // Run all task with limit
    }
    catch (err) {
        console.log('❌ Error when run process ts to zod', err.message);
    }
});
exports.runTsToZod = runTsToZod;
