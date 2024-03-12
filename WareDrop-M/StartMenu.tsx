import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
import styles from "./StyleSheet";

function StartMenu({navigation}){

    return(
        <View style={styles.container}>
            <View>
                <Text>Welcome Worker!</Text>
            </View>

                <TouchableOpacity
                    style={styles.loginBtn}
                onPress={()=>navigation.navigate('My_Deliveries')}
                >
                    <Text style={styles.TextInput}>My deliveries</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.loginBtn}
                onPress={()=>navigation.navigate('Avaliable')}
                >
                    <Text style={styles.TextInput}>Avaliable</Text>
                </TouchableOpacity>


            <TouchableOpacity
                style={styles.loginBtn}
            onPress={()=>navigation.navigate('Login')}
            >
                <Text style={styles.TextInput}>Log out</Text>
            </TouchableOpacity>


        </View>
    )


}
export default StartMenu