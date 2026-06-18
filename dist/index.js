require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 879:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendLensEvent = sendLensEvent;
async function sendLensEvent(apiHost, apiKey, payload) {
    const baseUrl = apiHost.replace(/\/$/, '');
    const url = `${baseUrl}/api/v1/events`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        let errorText = '';
        try {
            errorText = await response.text();
        }
        catch {
            // Ignore text extraction errors
        }
        throw new Error(`Failed to send event to Lens: ${response.status} ${response.statusText}. ${errorText}`);
    }
}


/***/ }),

/***/ 730:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = run;
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const github = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/github'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const api_1 = __nccwpck_require__(879);
const utils_1 = __nccwpck_require__(798);
async function run() {
    try {
        const apiHost = core.getInput('api_host', { required: true });
        const apiKey = core.getInput('api_key', { required: true });
        const workflowName = core.getInput('workflow_name', {
            required: true,
        });
        const artifactInput = core.getInput('artifact');
        const tagsInput = core.getInput('tags');
        const customDataInput = core.getInput('custom_data');
        const metricsInput = core.getInput('metrics');
        const repository = process.env.GITHUB_REPOSITORY ||
            `${github.context.repo.owner}/${github.context.repo.repo}`;
        const commitSha = process.env.GITHUB_SHA || github.context.sha;
        const payload = {
            repository,
            commit_sha: commitSha,
            workflow_name: workflowName,
        };
        if (artifactInput) {
            const parsedArtifact = (0, utils_1.parseMultilineDictionary)(artifactInput);
            if (parsedArtifact.name && parsedArtifact.version) {
                payload.artifact = {
                    name: parsedArtifact.name,
                    version: parsedArtifact.version,
                };
            }
            else {
                core.warning("Artifact input must contain both 'name' and 'version' fields. Ignoring artifact context.");
            }
        }
        const parsedTags = (0, utils_1.parseMultilineDictionary)(tagsInput);
        if (Object.keys(parsedTags).length > 0) {
            payload.tags = parsedTags;
        }
        const parsedCustomData = (0, utils_1.parseMultilineDictionary)(customDataInput);
        if (Object.keys(parsedCustomData).length > 0) {
            payload.custom_data = parsedCustomData;
        }
        const parsedMetrics = (0, utils_1.parseNumericDictionary)(metricsInput);
        if (Object.keys(parsedMetrics).length > 0) {
            payload.metrics = parsedMetrics;
        }
        core.debug(`Sending payload to Lens: ${JSON.stringify(payload)}`);
        await (0, api_1.sendLensEvent)(apiHost, apiKey, payload);
        core.info(`Successfully logged event to Lens for repository: ${repository}`);
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(`Unknown error occurred: ${String(error)}`);
        }
    }
}


/***/ }),

/***/ 798:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseMultilineDictionary = parseMultilineDictionary;
exports.parseNumericDictionary = parseNumericDictionary;
/**
 * Parses a multiline YAML-style string into a dictionary.
 * Supports delimiters: colon (`:`) or equals (`=`).
 * Ignores empty lines or lines without a delimiter.
 */
function parseMultilineDictionary(input) {
    const result = {};
    if (!input) {
        return result;
    }
    const lines = input.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }
        const colonIndex = trimmed.indexOf(':');
        const equalsIndex = trimmed.indexOf('=');
        let delimiterIndex = -1;
        if (colonIndex !== -1 && equalsIndex !== -1) {
            delimiterIndex = Math.min(colonIndex, equalsIndex);
        }
        else if (colonIndex !== -1) {
            delimiterIndex = colonIndex;
        }
        else if (equalsIndex !== -1) {
            delimiterIndex = equalsIndex;
        }
        if (delimiterIndex !== -1) {
            const key = trimmed.substring(0, delimiterIndex).trim();
            const value = trimmed.substring(delimiterIndex + 1).trim();
            // Remove surrounding quotes if they exist and match
            const unquotedValue = value.replace(/^(['"])(.*)\1$/, '$2');
            result[key] = unquotedValue;
        }
    }
    return result;
}
/**
 * Converts a string-based dictionary to a numeric dictionary.
 * Values that cannot be parsed as floats are ignored.
 */
function parseNumericDictionary(input) {
    const stringDict = parseMultilineDictionary(input);
    const numericDict = {};
    for (const [key, value] of Object.entries(stringDict)) {
        const parsed = Number(value);
        if (!isNaN(parsed) && value.trim() !== '') {
            numericDict[key] = parsed;
        }
    }
    return numericDict;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const main_1 = __nccwpck_require__(730);
(0, main_1.run)();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map