import { readFileSync } from 'fs';
import { parseOBJ } from '../obj_parser.js';

// read the OBJ file as plain text
const objText = readFileSync('obj_files/cube.obj', 'utf8');

// parse it
const objData = parseOBJ(objText);

// print parsed data
console.log(JSON.stringify(objData, null, 2));  