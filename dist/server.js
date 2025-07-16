"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const port = env_1.envs.APP_PORT;
app_1.default.listen(port, () => {
    console.log(`Flowbuild API running on port: ${port}`);
});
