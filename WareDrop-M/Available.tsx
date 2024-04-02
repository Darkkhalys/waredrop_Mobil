import {Text, TouchableOpacity, View} from "react-native";
import styles from "./StyleSheet";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios  from "axios";
import baseUrl from "./BaseUrl";
import AvailableList from "./AvailableList";
import TransDTO from "./AvailableShowList";
import AvailableSelect from "./AvailableSelect";


// @ts-ignore
function Available({navigation}){
const [available,setAvailable] =useState<TransDTO[]>()
const [selectedTransaction,setSelectedTransaction] = useState(false)
const [transactionId,setTransactionId]=useState<number|null>(null)


    useEffect(() => {
        const List = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (baseUrl && storedToken) {
                    axios.get(`${baseUrl}/transactions/available`)
                        .then((response) => {
                            const data=response.data;
                            setAvailable(data);
                            console.log("Ez a lista: ", data)
                        })
                        .catch((error) => {
                            console.log("Ez egy error: ", error);
                        });
                }
            } catch (error) {
                console.log("Ez egy error: ", error);
            }
        };
        List();
    }, []);

    const selectTransaction=()=>{
        setSelectedTransaction(true)
    }

    const showTransactions = (id:number) => {
        console.log("Clicked transaction with ID:", id)
        setTransactionId(id-1)
    };

    const goBack=()=>{
        setTransactionId(null)
    }

    const error =()=>{
        if (available&&transactionId!==null) {
            console.log("Legyen jó: ", available[transactionId])
        }
    }

    const goBackToStartMenu = () => {
            navigation.navigate('StartMenu');
        };

        return(
            <View>
                {
                    transactionId ===null?

                <View>
                        {available !== undefined ? <AvailableList list={available} onClick={showTransactions}/> :
                        <Text>There aren't any available transactions </Text>}

                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={goBackToStartMenu}>
                        <Text style={styles.TextInput}>Go back</Text>
                    </TouchableOpacity>

                </View> :
                        <View>
                            {available &&
                            <AvailableSelect list={available[transactionId]} back={goBack}/>}


                        </View>


                }
            </View>


        );
    }


    export default Available