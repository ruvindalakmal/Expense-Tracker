import { firestore } from "@/config/firebase";
import { collection, onSnapshot, query, QueryConstraint } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

const useFetchData = <T>(
    collectionName : string,
    constraints : QueryConstraint[] = []
) => {

    const [data, setData] = React.useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!collectionName) return;
        const collctionRef = collection(firestore,collectionName);
        const q = query(collctionRef, ...constraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => {
                return { id: doc.id, ...doc.data() };
            }) as T[];
            setData(fetchedData);
            setLoading(false);
        },(error) => {
            console.error("Error fetching data: ", error);
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName, JSON.stringify(constraints)]);

    return ({data, loading, error});
};

export default useFetchData;

const styles = StyleSheet.create({});