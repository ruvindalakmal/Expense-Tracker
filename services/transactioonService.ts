import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
// 'Partial' is a built-in TypeScript utility type, no import needed if using TypeScript

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
) : Promise<ResponseType> => {
    try {
        const { id, type, walletId, amount, image } = transactionData;
        if (!amount || amount <= 0 || !walletId || !type) {
            return { success: false, msg: "Invalid Transaction data" };
        }

        if (id) {
            // todo : update existing transaction
        } else {
            // update wallet for new transaction
            
            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            );
            if(!res.success) return res;
        }

        if(image){
                    const imageUploadRes = await uploadFileToCloudinary(
                        image,
                        "transactions"
                    );
                    if(!imageUploadRes.success){
                        return {success : false, msg: imageUploadRes.msg || "Failed to upload reciept"};
                    }
                    transactionData.image = imageUploadRes.data;
        }

        const transactionRef = id 
            ? doc(firestore, "transactions" , id)
            : doc(collection(firestore, "transactions"));

        await setDoc(transactionRef , transactionData , {merge : true})
        

        return { success: true , data : {...transactionData , id : transactionRef.id} };
    } catch (error: any) {
        console.log("Error Creating or Updating Transaction : " + error);
        return { success: false, msg: error.message }
    }
};

const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnapShot = await getDoc(walletRef);

        if (!walletSnapShot.exists()) {
            console.log("Error Updating Wallet for new Transaction : ");
            return { success: false, msg: "Wallet not found" };
        }

        const walletData = walletSnapShot.data() as WalletType;

        if (type == "expense" && walletData.amount! - amount < 0){
            return {
                success : false,
                msg : "Selected wallet don't have enough balance"
            };
        }

        const updateType = type == "income" ? "totalIncome" : "totalExpenses" ;
        const updatedWalletAmount = 
            type == "income"
            ? Number(walletData.amount) + amount
            : Number(walletData.amount) - amount;

        const updatedTotals = 
            type == "income"
            ? Number(walletData.totalIncome) + amount
            : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef , {
            amount : updatedWalletAmount,
            [updateType] : updatedTotals,
        });

        return { success: true };
    } catch (error: any) {
        console.log("Error Updating Wallet for new Transaction : " + error);
        return { success: false, msg: error.message }
    }
};

