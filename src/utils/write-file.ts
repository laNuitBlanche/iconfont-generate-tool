import path from 'path';
import fs from 'fs';

export function writeFileAsync(filename: string,data: string){
  return new Promise((resolve, reject) =>{
    const dir = path.dirname(filename);
    mkdirs(dir);
    fs.writeFile(filename,data,err =>{
      !err?resolve():reject(err);
    })
  })
}

function mkdirs(dirpath:string) {
  if(fs.existsSync(path.dirname(dirpath))){
    mkdirs(path.dirname(dirpath));
  }
  if(!fs.existsSync(dirpath)){
    fs.mkdirSync(dirpath);
  }
}