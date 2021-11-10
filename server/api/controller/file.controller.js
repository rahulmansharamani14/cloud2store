require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const azureStorage = require("azure-storage");
const storage = require("@azure/storage-blob");

const cerds = new storage.StorageSharedKeyCredential(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);

const blobService = azureStorage.createBlobService();
// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const File = require("../models/file");

module.exports.uploadFile = async (containerName, blobName, file_buffer) => {
    const client = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = client.getBlockBlobClient(blobName);
    const blob = await blockBlobClient.uploadData(file_buffer);

    console.log("state of blob : " + blob.versionId);
    console.log(JSON.stringify(blob));
    return blob.versionId;
};

module.exports.getMetaDataOnBlob = async (containerName, blobName) => {
    let result;
    blobService.getBlobMetadata(containerName, blobName, function (err, result, response) {
        console.log("response: ", response);
        if (err) {
            console.error("Couldn't fetch metadata for blob %s", blobName);
            console.error(err);
        } else if (!response.isSuccessful) {
            console.error("Blob %s wasn't found container %s", blobName, containerName);
        } else {
            console.log("Successfully fetched metadata for blob %s", blobName);
            console.log(result.metadata);
            result = result.metadata;
        }
    });
    return result;
};

module.exports.createContainer = async (containerName) => {
    console.log("\nCreating container...");
    console.log("\t", containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
};

module.exports.getSASUrl = async (containerName, blobName) => {
    const key = new storage.StorageSharedKeyCredential((accountName = process.env.AZURE_STORAGE_ACCOUNT), (accountKey = process.env.AZURE_STORAGE_ACCESS_KEY));

    //This URL will be valid for 1 hour
    const expDate = new Date(new Date().valueOf() + 3600 * 1000);

    //Set permissions to read, write, and create to write back to Azure Blob storage
    const containerSAS = storage
        .generateBlobSASQueryParameters(
            {
                containerName: containerName,
                permissions: "r",
                expiresOn: expDate,
            },
            key
        )
        .toString();

    SaSURL = "https://" + accountName + ".blob.core.windows.net/" + containerName + "/" + blobName + "?" + containerSAS;
    console.log(`SAS URL for blob is: ${SaSURL}`);
    return SaSURL;
};

module.exports.DeleteFile = async (containerName, blobName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const state = await containerClient
        .deleteBlob(blobName)
        .then(() => {
            console.log("deleted file");
            return true;
        })
        .catch((err) => {
            console.log("err on file delete");
            console.log(err.message);
            return false;
        });

    return state;
};

module.exports.deleteBlobDB = async (user_id, filename) => {
    return await File.deleteOne({ user_id: user_id, filename: filename })
        .then(() => {
            console.log("file deleted in DB");
            return true;
        })
        .catch((err) => {
            console.log("err on file delete in DB");
            console.log(err.message);
            return false;
        });
};
