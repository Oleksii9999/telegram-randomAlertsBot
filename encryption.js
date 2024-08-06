import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const password = 'my secret key';
const key = crypto.scryptSync(password, 'salt', 32);
const iv = Buffer.alloc(16, 0);

export const encrypt = (data) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export const decrypt = (cipher) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(cipher, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted
    }
    catch(err) {
        return false
    }
}
