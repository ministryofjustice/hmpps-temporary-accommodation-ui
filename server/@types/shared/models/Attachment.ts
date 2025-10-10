/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Attachment = {
    /**
     * The number of the attachment which will match any corresponding reference in the content section
     */
    attachmentNumber: number;
    /**
     * The content type of the attachment
     */
    contentType: string;
    /**
     * The filename of attachment file
     */
    filename: string;
    /**
     * The size of the attachment file in bytes
     */
    filesize: number;
    /**
     * The name or description of the attachment which will be included in the report
     */
    name: string;
    /**
     * The url to be used to download the attachment file
     */
    url: string;
};

