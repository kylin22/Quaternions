<script setup lang="ts">
import { Quaternion, Vector3 } from 'three';
import { ref, watch } from 'vue';

const quaternionLabels = ref(['W', 'X', 'Y', 'Z']);
const vectorLabels = ref(["X", "Y", "Z"]);
const quaternion = ref(new Quaternion(0, 0, 0, 1));
const numericalInputs = ref([1, 0, 0, 0]);
const vectorInputs = ref([1, 0, 0]);

const emit = defineEmits(["quaternion", "vector", "guidelines"]);

watch(quaternion, (newQuaternion) => {
    numericalInputs.value = [newQuaternion.w, newQuaternion.x, newQuaternion.y, newQuaternion.z];
    quaternion.value = newQuaternion;
    emit("quaternion", newQuaternion);
}, { deep: true });

const updateQuaternions = (index: number, newValue: number) => {
    const checkQuaternionValue = (value: number) => {
        return isNaN(value) ? 0 : Math.max(-1, Math.min(1, value));
    }
    switch (index) {
        case 0:
            quaternion.value.w = checkQuaternionValue(newValue);
            break;
        case 1:
            quaternion.value.x = checkQuaternionValue(newValue);
            break;
        case 2:
            quaternion.value.y = checkQuaternionValue(newValue);
            break;
        case 3:
            quaternion.value.z = checkQuaternionValue(newValue);
            break;
    }
    quaternion.value.normalize();
};

const updateQuaternionInput = (index: number, event: Event) => {
    const inputValue = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
        updateQuaternions(index, parsedValue);
    }
};

const updateVectorInput = (index: number, event: Event) => {
    const inputValue = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
        vectorInputs.value[index] = parsedValue;
    }
    emit("vector", new Vector3(...vectorInputs.value));
};
</script>

<template>
    <div id="UI">
        <h1>Quaternion</h1>
        <div class="inputs">
            <div class="slider-container" v-for="(label, index) in quaternionLabels" :key="index">
                <label>{{ label }}</label>
                <input
                    type="number" 
                    step="0.001" 
                    min="-1" 
                    max="1" 
                    :value="numericalInputs[index].toFixed(3)"
                    @input="updateQuaternionInput(index, $event)"
                    class="quaternion-input"
                >
                <input 
                    id="q-slider" 
                    type="range" 
                    min="-1" 
                    max="1"
                    step="0.001" 
                    :value="numericalInputs[index]"
                    @input="updateQuaternionInput(index, $event)"
                    class="quaternion-slider"
                >
            </div>
        </div>
        <h1>Vector</h1>
        <div class="inputs">
            <div class="slider-container" v-for="(label, index) in vectorLabels" :key="index">
                <label>{{ label }}</label>
                <input
                    type="number" 
                    step="0.001" 
                    min="-1" 
                    max="1" 
                    :value="vectorInputs[index].toFixed(3)"
                    @input="updateVectorInput(index, $event)"
                    class="quaternion-input"
                >
                <input 
                    id="q-slider" 
                    type="range" 
                    min="-1" 
                    max="1"
                    step="0.001" 
                    :value="vectorInputs[index]"
                    @input="updateVectorInput(index, $event)"
                    class="quaternion-slider"
                >
            </div>
        </div>
        <h1>Information</h1>
        <div class="checkbox">
            <label for="guidelines">Display Guidelines</label>
            <input 
                name="guidelines" 
                type="checkbox"
                @input="$emit('guidelines', ($event.target as HTMLInputElement).checked)"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
    #UI {
        padding: 12px;
        background-color: rgb(14, 14, 14);
        border: 2px solid rgb(147, 147, 147);
        width: 25%;
    }

    h1 {
        text-shadow: 4px 4px rgb(68, 68, 68);
    }

    .checkbox {
        display: flex;
        border-left: solid rgb(147, 147, 147);
        padding: 5px;
        input {
            margin: 5px;
        }
    }

    .inputs {
        box-shadow: 8px 8px rgb(31, 31, 31);
        margin-top: 10px;
        margin-bottom: 10px;
        padding: 6px;
        background-color: rgb(40, 40, 40);
        border: 2px solid rgb(147, 147, 147);
        height: 180px;
        width: 100%;
        flex-grow: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .quaternion-slider {
        flex-grow: 1;
    }

    .quaternion-input {
        margin-top: 3px;
        margin-right: 4px;
        border: 2px solid rgb(147, 147, 147);
        background-color: rgb(40, 40, 40);
        color: white; 
    }

    .slider-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        height: 100%;
    }

    #inputs .slider-container label {
        display: inline-block;
        width: 25px;
        text-align: center;
        flex-grow: 0;
    }

    input[type='range'] {
        margin-top: 3px;
        -webkit-appearance: none !important;
        background:rgb(107, 107, 107);
        height:7px;
        
    }

    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        background:rgb(255, 255, 255);
        height:10px;
        width:10px;
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type=number] {
        -moz-appearance: textfield;
    }

    input:focus {
        outline: 2px solid rgba(147, 147, 147);
    }
</style>