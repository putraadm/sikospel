declare module 'three' {
    export class Scene {
        add(object: any): void;
    }
    export class OrthographicCamera {
        constructor(left: number, right: number, top: number, bottom: number, near: number, far: number);
    }
    export class PlaneGeometry {
        constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
        dispose(): void;
    }
    export class ShaderMaterial {
        constructor(parameters?: any);
        uniforms: { [uniform: string]: { value: any } };
        dispose(): void;
    }
    export class WebGLRenderer {
        constructor(parameters?: any);
        domElement: HTMLCanvasElement;
        setSize(width: number, height: number, updateStyle?: boolean): void;
        render(scene: any, camera: any): void;
        setPixelRatio(value: number): void;
        setClearColor(color: any, alpha?: number): void;
        dispose(): void;
    }
    export class Mesh {
        constructor(geometry?: any, material?: any);
    }
    export class Clock {
        constructor(autoStart?: boolean);
        getDelta(): number;
        elapsedTime: number;
    }
    export class Vector2 {
        constructor(x?: number, y?: number);
        set(x: number, y: number): this;
        copy(v: Vector2): this;
        lerp(v: Vector2, alpha: number): this;
    }
    export class Vector3 {
        constructor(x?: number, y?: number, z?: number);
        set(x: number, y: number, z: number): this;
        copy(v: Vector3): this;
    }
    export const SRGBColorSpace: any;
}
