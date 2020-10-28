import crypto from 'crypto';

function md5(str: string): string {
  const md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
}

export default md5;