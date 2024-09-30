<script setup lang="ts">
import Tres, { TresCanvas, TresInstance } from "@tresjs/core";
import { Line2, OrbitControls, Plane, Text3D } from "@tresjs/cientos";
import { reactive, ref, shallowRef, watch } from "vue";
import Axis from "@/classes/Axis";
import { BufferGeometry, Camera, DoubleSide, Euler, LineBasicMaterial, MeshBasicMaterial, PerspectiveCamera, Quaternion, Scene, ShapeGeometry, Vector3 } from "three";
import { computed, toRef } from "@vue/reactivity";

const AXIS_LENGTH = 1;
const AXIS_WIDTH = 5;
const VECTOR_WIDTH = 3;
const TRACE_SEGMENTS = 25;

const axes = [
    new Axis("x", "red", new Vector3(AXIS_LENGTH, 0, 0)),
    new Axis("y", "green", new Vector3(0, AXIS_LENGTH, 0)),
    new Axis("z", "blue", new Vector3(0, 0, AXIS_LENGTH)),
];

const quaternionLabels = ref(['W', 'X', 'Y', 'Z']);
const numericalInputs = ref([1, 0, 0, 0]);

const quaternion = ref(new Quaternion(0, 0, 0, 1));
const axisVector = ref(new Vector3(0, 0, 0));
const lineTracePoints = ref([new Vector3(0, 0, 0)]);

const camera = ref<PerspectiveCamera>();
const cameraQuaternion = computed(() => {
    return camera.value ? camera.value.quaternion : new Quaternion(0, 0, 0, 1);
});

watch(quaternion, (newQuaternion) => {
    numericalInputs.value = [newQuaternion.w, newQuaternion.x, newQuaternion.y, newQuaternion.z];
    quaternion.value = newQuaternion;
    axisVector.value = findRotationAxis(newQuaternion);
    lineTracePoints.value = updateLineTrace(newQuaternion);
    console.log(lineTracePoints.value[25]);
}, { deep: true });

const findRotationAxis = (quaternion: Quaternion) => {
    const rotationAxis = new Vector3();
    const theta = Math.acos(quaternion.w) * 2;
    const sin = Math.sin(theta / 2);
    if (sin >= 0.01 || sin <= -0.01) {
        rotationAxis.x = quaternion.x / sin;
        rotationAxis.y = quaternion.y / sin;
        rotationAxis.z = quaternion.z / sin;
        rotationAxis.normalize();
    }
    return rotationAxis;
}

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

const updateInput = (index: number, event: Event) => {
    const inputValue = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
        updateQuaternions(index, parsedValue);
    }
};

const updateLineTrace = (quaternion: Quaternion) => {
    let linePoints: Vector3[] = [];
    for (let i = 0; i <= TRACE_SEGMENTS; i++) {
        let currentQuaternion = new Quaternion().slerp(quaternion, i / TRACE_SEGMENTS);
        var currentVector = new Vector3(AXIS_LENGTH, 0, 0); //x-axis placeholder
        currentVector.applyQuaternion(currentQuaternion);
        linePoints.push(currentVector);
    }
    return linePoints;
} 
    
    // for (let i = 0; i <= TRACE_SEGMENTS; i++) {
    //     var currentQuat = new Quaternion().slerp(vectorQuaternion, i / TRACE_SEGMENTS);
    //     var currentVector = new Vector3(AXIS_LENGTH, 0, 0);
    //     currentVector.applyQuaternion(currentQuat);
    //     meshTraceGeom.vertices.push(currentVector);
    //     lineTraceGeom.vertices.push(currentVector);
    // }
    // for (let i = 0; i <= TRACE_SEGMENTS; i++) {
    //     meshTraceGeom.faces.push(new THREE.Face3(0, i, i+1));
    // }

</script>

<template>
    <div id="container">
        <div id="UI">
            <div></div>
            <div id="inputs">
                <div class="slider-container" v-for="(label, index) in quaternionLabels" :key="index">
                    <label>{{ label }}</label>
                    <input
                        type="number" 
                        step="0.001" 
                        min="-1" 
                        max="1" 
                        :value="numericalInputs[index].toFixed(3)"
                        @input="updateInput(index, $event)"
                        class="quaternion-input"
                    >
                    <input 
                        id="q-slider" 
                        type="range" 
                        min="-1" 
                        max="1"
                        step="0.001" 
                        :value="numericalInputs[index]"
                        @input="updateInput(index, $event)"
                        class="quaternion-slider"
                    >
                </div>
            </div>
        </div>
        <div id="canvas">
            <TresCanvas>
                <TresPerspectiveCamera
                    ref="camera"
                    :position="[1.5, 1.5, 1.5]"
                    :fov="45"
                    :look-at="[0, 0, 0]"
                />
                <OrbitControls/>
                <Line2 
                    v-for="axis in axes"
                    :points="[new Vector3(0, 0, 0), axis.endPoint]"
                    :line-width="AXIS_WIDTH"
                    :color="axis.color"
                />
                <Suspense v-for="axis in axes">
                    <Text3D 
                        :quaternion="new Quaternion().copy(cameraQuaternion)"
                        :text="axis.name" 
                        :size="0.08" 
                        :height="0.01" 
                        font="/Roboto_Regular.json" 
                        :center="true" 
                        :position="new Vector3().copy(axis.endPoint).multiplyScalar(1.05)"
                        :bevel-enabled="false"
                    />
                </Suspense>
                <Line2
                    :points="[new Vector3(0, 0, 0), axisVector]"
                    :line-width="VECTOR_WIDTH"
                    color="white"
                />
                <Suspense>
                    <Text3D
                        :quaternion="new Quaternion().copy(cameraQuaternion)"
                        :text="`(${axisVector.x.toFixed(3)}, ${axisVector.y.toFixed(3)}, ${axisVector.z.toFixed(3)})`"
                        :size="0.04"
                        :height="0.001" 
                        font="/Roboto_Regular.json" 
                        :center="true" 
                        :position="new Vector3().copy(axisVector).multiplyScalar(1.05)"
                        :bevel-enabled="false"
                    />
                </Suspense>
                <Line2 :points="[new Vector3(0, 0, 0), lineTracePoints[25]]" :line-width="VECTOR_WIDTH" color="blue"/>
                <!-- <TresMesh :position="[0.5, 0.5, 0.5]">
                    <TresShapeGeometry />
                    <TresMeshBasicMaterial color="blue" :side="DoubleSide" :transparent="true" :opacity="0.05"/>
                </TresMesh> -->
                <TresGridHelper :scale="0.2"/>
            </TresCanvas>
        </div>
    </div>
</template>

<style scoped lang="scss">
    #container {
        display: flex;
        flex-direction: row-reverse;
        width: 100%;
        height: 100%;
    }

    #UI {
        padding: 6px;
        background-color: rgb(40, 40, 40);
        border: 2px solid rgb(147, 147, 147);
        width: 25%;
    }

    #inputs {
        padding: 4px;
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

    #canvas {
        flex-grow: 1;
    }
</style>