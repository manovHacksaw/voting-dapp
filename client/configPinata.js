import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK(process.env.NEXT_PUBLIC_PINATA_API_KEY, process.env.NEXT_PUBLIC_PINATA_API_SECRET)