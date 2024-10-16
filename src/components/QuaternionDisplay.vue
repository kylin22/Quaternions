<script setup lang="ts">
import Tres, { TresCanvas, TresInstance } from "@tresjs/core";
import { Line2, OrbitControls, Plane, Text3D } from "@tresjs/cientos";
import { inject, ref, watch, watchEffect } from "vue";
import Axis from "@/classes/Axis";
import { PerspectiveCamera, Quaternion, Scene, ShapeGeometry, Vector3 } from "three";
import { computed, Ref } from "@vue/reactivity";
import { radToDeg } from "three/src/math/MathUtils";

const AXIS_LENGTH = 1;
const AXIS_WIDTH = 5;
const VECTOR_WIDTH = 3;
const GUIDELINE_WIDTH = 1;
const TRACE_LINE_WIDTH = 2;
const TRACE_SEGMENTS = 30;

const axes = [
    new Axis("x", "red", new Vector3(AXIS_LENGTH, 0, 0)),
    new Axis("y", "green", new Vector3(0, AXIS_LENGTH, 0)),
    new Axis("z", "blue", new Vector3(0, 0, AXIS_LENGTH)),
];

const inputQuaternion = inject<Ref<Quaternion>>("quaternion")!;
const rotatedVector = inject<Ref<Vector3>>("vector")!;
const guidelines = inject<Ref<Boolean>>("guidelines")!;

const axisVector = ref(new Vector3(0, 0, 0));
const axisProjectionVector = ref(new Vector3(0, 0, 0));
const lineTracePoints = ref([new Vector3(0, 0, 0)]);
// const rotatedVector = ref(new Vector3(AXIS_LENGTH, 0, 0));
const radiusLinePoints = ref([new Vector3(0, 0, 0)]);
const theta = ref(0);
const resultantVector = ref(new Vector3(1, 0, 0));
const resultantProjectionVector = ref(new Vector3(0, 0, 0))

const camera = ref<PerspectiveCamera>();
const cameraQuaternion = computed(() => {
    return camera.value ? camera.value.quaternion : new Quaternion(0, 0, 0, 1);
});

watchEffect(() => {
  console.log(inputQuaternion)
})

watch(inputQuaternion, (newQuaternion) => {
    resultantVector.value = new Vector3().copy(rotatedVector.value).applyQuaternion(newQuaternion);
    axisVector.value = findRotationAxis(newQuaternion);
    lineTracePoints.value = updateLineTrace(newQuaternion);
    radiusLinePoints.value = updateRadiusTrace(newQuaternion);
    axisProjectionVector.value = new Vector3(axisVector.value.x, 0, axisVector.value.z);
    resultantProjectionVector.value = new Vector3(resultantVector.value.x, 0, resultantVector.value.z);
}, { deep: true });

watch(rotatedVector, (newVector) => {
    resultantVector.value = new Vector3().copy(newVector).applyQuaternion(inputQuaternion.value);
    axisVector.value = findRotationAxis(inputQuaternion.value);
    lineTracePoints.value = updateLineTrace(inputQuaternion.value);
    radiusLinePoints.value = updateRadiusTrace(inputQuaternion.value);
    axisProjectionVector.value = new Vector3(axisVector.value.x, 0, axisVector.value.z);
    resultantProjectionVector.value = new Vector3(resultantVector.value.x, 0, resultantVector.value.z);
}, { deep: true });

const findRotationAxis = (quaternion: Quaternion) => {
    const rotationAxis = new Vector3();
    theta.value = Math.acos(quaternion.w) * 2;
    const sin = Math.sin(theta.value / 2);
    if (sin >= 0.01 || sin <= -0.01) {
        rotationAxis.x = quaternion.x / sin;
        rotationAxis.y = quaternion.y / sin;
        rotationAxis.z = quaternion.z / sin;
        rotationAxis.normalize();
    }
    return rotationAxis;
}

const updateLineTrace = (quaternion: Quaternion) => {
    let linePoints: Vector3[] = [];
    for (let i = 0; i <= TRACE_SEGMENTS; i++) {
        let currentQuaternion = new Quaternion().slerp(quaternion, i / TRACE_SEGMENTS);
        const currentVector = new Vector3().copy(rotatedVector.value);
        currentVector.applyQuaternion(currentQuaternion);
        linePoints.push(currentVector);
    }
    return linePoints;
}

const updateRadiusTrace = (quaternion: Quaternion) => {
    let linePoints: Vector3[] = [];
    let radiusQuaternion = new Quaternion().slerp(quaternion, 0.5);
    const endPoint = new Vector3().copy(rotatedVector.value);
    endPoint.applyQuaternion(radiusQuaternion);
    const startPoint = new Vector3().copy(endPoint).projectOnVector(axisVector.value);

    linePoints.push(startPoint, endPoint);
    return linePoints;
}
 
</script>

<template>
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

            <Line2 v-if="axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0"
                :points="lineTracePoints" 
                :line-width="TRACE_LINE_WIDTH" 
                color="#326ba8"
            />
            <Line2 v-if="axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0"
                :points="[new Vector3(0, 0, 0), rotatedVector]" 
                :line-width="VECTOR_WIDTH" 
                color="yellow"
            />
            <Line2 v-if="axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0"
                :points="[new Vector3(0, 0, 0), resultantVector]" 
                :line-width="VECTOR_WIDTH" 
                color="yellow"
            />
            <Line2 v-if="guidelines && (axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0)"
                :points="[new Vector3(0, 0, 0), resultantProjectionVector, resultantVector]" 
                :line-width="GUIDELINE_WIDTH" 
                color="yellow"
            />
            <Line2 v-if="guidelines && (axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0)"
                :points="[new Vector3(0, 0, 0), new Vector3(rotatedVector.x, 0, rotatedVector.z), rotatedVector]" 
                :line-width="GUIDELINE_WIDTH" 
                color="yellow"
            />
            <Line2 v-if="guidelines && (axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0)"
                :points="radiusLinePoints" 
                :line-width="GUIDELINE_WIDTH" 
                color="#326ba8"
            />
            
            <Line2
                :points="[new Vector3(0, 0, 0), axisVector]"
                :line-width="VECTOR_WIDTH"
                color="white"
            />
            <Line2
                :points="[new Vector3(0, 0, 0), new Vector3().copy(axisVector).negate()]"
                :line-width="TRACE_LINE_WIDTH"
                color="grey"
            />
            <Line2 v-if="guidelines"
                :points="[new Vector3(0, 0, 0), axisProjectionVector, axisVector]"
                :line-width="GUIDELINE_WIDTH"
                color="grey"
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
            <Suspense v-if="axisVector.x !== 0 || axisVector.y !== 0 || axisVector.z !== 0">
                <Text3D
                    :quaternion="new Quaternion().copy(cameraQuaternion)"
                    :text="`${radToDeg(theta) < 180 ? radToDeg(theta).toFixed(2) : (-radToDeg(theta) + 360).toFixed(2)}°`"
                    :size="0.04"
                    :height="0.001" 
                    font="/Roboto_Regular.json" 
                    :center="true" 
                    :position="new Vector3().copy(radiusLinePoints[1]).multiplyScalar(1.05)"
                    :bevel-enabled="false"
                />
            </Suspense>
            
            <TresGridHelper :scale="0.2"/>
        </TresCanvas>
    </div>
</template>

<style scoped lang="scss">
    #canvas {
        flex-grow: 1;
    }
</style>