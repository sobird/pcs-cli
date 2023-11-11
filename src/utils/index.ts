import fs from "fs";
import { dirname } from "path";
import crypto from "crypto";

export function md5File(file: string, callback: typeof Function) {
  const hash = crypto.createHash("md5");
  const rs = fs.createReadStream(file);
  rs.on("data", (chunk) => {
    hash.update(chunk);
  });
  rs.on("end", () => {
    callback(hash.digest("hex"));
  });
}

export function md5FileSync(file: string) {
  const hash = crypto.createHash("md5");
  const data = fs.readFileSync(file);
  hash.update(data);
  return hash.digest("hex");
}

export function writeJson(path: string, json: object, callback: typeof Function) {
  fs.mkdir(dirname(path), { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
    fs.writeFile(path, JSON.stringify(json), (err) => {
      if (err) {
        throw err;
      }
      callback();
    });
  });
}

export function writeJsonSync(path: string, json: object) {
  fs.mkdirSync(dirname(path), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(json));
}
