import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateWallet = async (
    walletData : Partial<WalletType>
): Promise<ResponseType> => {
    try {
        let walletToSave = {...walletData}

        if(walletData.image){
                    const imageUploadRes = await uploadFileToCloudinary(
                        walletData.image,
                        "wallets"
                    );
                    if(!imageUploadRes.success){
                        return {success : false, msg: imageUploadRes.msg || "Failed to upload wallet icon"};
                    }
                    walletToSave.image = imageUploadRes.data;
        }

        if(!walletData?.id){
            // new wallet
            walletToSave.amount = 0;
            walletToSave.totalIncome = 0;
            walletToSave.totalExpenses = 0;
            walletToSave.created = new Date();   
        }

        const walletRef = walletData?.id
            ? doc(firestore , "wallets", walletData?.id)
            : doc(collection(firestore, "wallets"));

        await setDoc(walletRef ,walletToSave, { merge: true });
        return { success: true, data: {...walletToSave , id : walletRef.id} };
    }catch (error : any) {
        console.log("Error creating or updating wallet: ", error);
        return { success: false, msg: error?.message || "Failed to create or update wallet" };
    }
}

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
    try {
        const walletRef = doc(firestore, "wallets", walletId);
        await deleteDoc(walletRef);
        
        deleteTransactionByWalletId(walletId);

        return { success: true, msg: "Wallet deleted successfully" };
    } catch (error: any) {
        console.log("Error deleting wallet: ", error);
        return { success: false, msg: error?.message || "Failed to delete wallet" };
    }
};

export const deleteTransactionByWalletId = async (walletId: string): Promise<ResponseType> => {
    try {
        const hasMoreTransactions = true;

        while (hasMoreTransactions) {
            const transactionsQuery = query(
                collection(firestore, "transactions"),
                where("walletId", "==", walletId)
            );

            const transactionsSnapshot = await getDocs(transactionsQuery);
            if (transactionsSnapshot.size == 0) {
                break; 
            };

            const batch = writeBatch(firestore);

            transactionsSnapshot.forEach((transactionDoc) => {
                batch.delete(transactionDoc.ref);
            });

            await batch.commit();

            console.log(`${transactionsSnapshot.size} transactions deleted in this batch`);

        }

        return { success: true, msg: "Wallet deleted successfully" };
    } catch (error: any) {
        console.log("Error deleting wallet: ", error);
        return { success: false, msg: error?.message || "Failed to delete wallet" };
    }
};