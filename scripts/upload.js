import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.LINODE_ACCESS_KEY,
    secretAccessKey: process.env.LINODE_SECRET_KEY,
    endpoint: `https://${process.env.LINODE_REGION}.linodeobjects.com`,
    s3ForcePathStyle: true,
    signatureVersion: "v4"
});

const distPath = "./dist"; 

async function uploadFile(filePath) {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const params = {
        Bucket: process.env.LINODE_BUCKET,
        Key: `${process.env.LINODE_FOLDER}/${fileName}`,
        Body: fileContent,
        ACL: "public-read"
    };

    return s3.upload(params).promise();
}

async function uploadAll() {
    const files = fs.readdirSync(distPath).filter(f =>
        f.endsWith(".exe") ||
        f.endsWith(".deb") ||
        f.endsWith(".AppImage") ||
        f.endsWith("latest.yml") ||
        f.endsWith("latest-linux.yml")
    );

    for (const file of files) {
        const filePath = path.join(distPath, file);
        console.log("Uploading:", filePath);

        await uploadFile(filePath);

        console.log("Uploaded:", file);
    }

    console.log("All files uploaded successfully!");
}

uploadAll().catch(console.error);
