# Edge Impulse JPG ingestion example

This shows how to sign and send JPG data to the Edge Impulse ingestion service. It does this by generating a script that will sign the JPG file, create a file in the [Edge Impulse Data Acquisition format](https://docs.edgeimpulse.com/reference-link/data-acquisition-format), and then call `curl` to upload the data. To do so:

1. Open `generate-metadata.js` and set your HMAC and API key.
1. Run:

    ```
    $ node generate-metadata.js
    ```

1. Upload the file via:

    ```
    $ sh upload.sh
    ```
