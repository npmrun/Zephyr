// import https from "node:https"

// const interceptRequestRemote = async (request, callback) => {
//     const client = https.request(request.url, {
//         method: request.method,
//         headers: { ...request.headers },
//     });
//     if (request.uploadData) {
//         for (const data of request.uploadData) {
//             if (data.type === "rawData") {
//                 // 直接创建Buffer对象
//                 client.write(data.bytes);
//                 // buffers.push(Buffer.from(data.bytes));
//             } else if (data.type === "blob") {
//                 // 通过blobUUID获取Buffer对象
//                 const buffer = await sess.getBlobData(data.blobUUID);
//                 client.write(buffer);
//             }
//         }
//     }
//     client.on("error", (err) => {
//         console.error(`sess request error: ${request.url}`, err);
//     });
//     client.on("response", (response) => {
//         let body = [];
//         response.on("error", (err) => {
//             console.error(`sess request response error: ${request.url}`, err);
//         });
//         response.on("data", (chunk) => {
//             body.push(chunk);
//         });
//         response.on("end", () => {
//             body = Buffer.concat(body);
//             callback({
//                 statusCode: response.statusCode,
//                 headers: response.headers,
//                 data: body,
//             });
//         });
//     });
//     console.log(`sess request: ${request.url}`);
//     client.end();
// };

// const interceptHandler = (request, callback) => {
//     const localPath = checkIsNeedLocal(request);
//     if (localPath) {
//         fs.readFile(localPath, (err, data) => {
//             if (err) {
//                 console.error("readFile error", err);
//                 interceptRequestRemote(request, callback);
//                 return;
//             }
//             const ext = path.extname(localPath);
//             const mimeType =
//                 ext === ".js"
//                     ? "application/javascript"
//                     : ext === ".css"
//                         ? "text/css"
//                         : "text/html";
//             callback({
//                 data,
//                 mimeType,
//             });
//         });
//     } else {
//         interceptRequestRemote(request, callback);
//     }
// };

// ses.protocol.interceptBufferProtocol("https", interceptHandler);
