const crypto = require('crypto');
const fs = require('fs');
const Path = require('path');

const HMAC_KEY = '00000000000000000000000000000000';
const API_KEY = 'ei_...';
const INGESTION_API = 'https://ingestion.edgeimpulse.com';

// Read the JPG file into a buffer
let buffer = fs.readFileSync(Path.join(__dirname, 'mark.jpg'));

// Sign the buffer with the HMAC key
let hmacImage = crypto.createHmac('sha256', HMAC_KEY);
hmacImage.update(buffer);

// Create an empty signature placeholder in the metadata
let emptySignature = Array(64).fill('0').join('');

let data = {
    protected: {
        ver: 'v1',
        alg: 'HS256',
    },
    signature: emptySignature,
    payload: {
        device_type: 'EDGE_IMPULSE_UPLOADER',
        interval_ms: 0,
        sensors: [{ name: 'image', units: 'rgba' }],
        // Size and HMAC signature of the jpg image here (as a string)
        values: [`Ref-BINARY-image/jpeg (${buffer.length} bytes) ${hmacImage.digest().toString('hex')}`]
    }
};

// Encode the metadata
let encoded = JSON.stringify(data);
// Sign the metadata with the HMAC key again
let hmac = crypto.createHmac('sha256', HMAC_KEY);
hmac.update(encoded);
// Update the signature in the metadata
let signature = hmac.digest().toString('hex');
data.signature = signature;

fs.writeFileSync(Path.join(__dirname, 'metadata.json'), JSON.stringify(data), 'utf-8');

// Create a script that can be run with cURL
let script = `#!/bin/bash
set -e

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

curl -X POST \\
    -H "x-api-key: ${API_KEY}" \\
    -H "x-file-name: mark.jpg" \\
    -H "x-label: mark" \\
    ${INGESTION_API}/api/training/data \\
    -F attachments[]="@$SCRIPTPATH/metadata.json;type=application/json" \\
    -F attachments[]="@$SCRIPTPATH/mark.jpg;type=image/jpeg"
`;

fs.writeFileSync(Path.join(__dirname, 'upload.sh'), script, 'utf-8');
