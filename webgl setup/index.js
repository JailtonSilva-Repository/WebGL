let quadGeometry = {
    verticesPosition: new Float32Array([
        -0.5, 0.5, 0.0, //top left vertex
        -0.5,-0.5, 0.0, //bottom left vertex
         0.5,-0.5, 0.0, //bottom right vertex
         0.5, 0.5, 0.0  //top right vertex
    ]), //vertices position (x, y, z)

    verticesColor: new Float32Array([
        1.0, 0.0, 0.0, //top left vertex color
        0.0, 1.0, 0.0, //bottom left vertex color
        0.0, 0.0, 1.0, //bottom right vertex color
        1.0, 0.0, 1.0  //top right vertex color
    ]), //vertex color (red, green, blue)

    indices: new Uint16Array([
        0, 1, 2, //bottom left face (top left + bottom left + bottom right)
        2, 3, 0  //top right face (bottom left + bottom right + top right)
    ]), //vertices indices to form one face (triangle)

    size: 3, //number of elements per vertex which are only the x, y, z values
    stride: 0, //number of bytes between different vertex data elements
    offset: 0, //number of bytes to the first element
    
    indicesCount: 6 //number of indices of this geometry
} //quad geometry infos

let shader = {
    vertexShaderCode: `
        attribute vec3 a_Position;
        attribute vec4 a_Color;

        uniform mat4 u_MvpMatrix;

        varying vec4 v_Color;

        void main(void){
            gl_Position = u_MvpMatrix * vec4(a_Position, 1);
            v_Color = a_Color;
        }`, //the vertex shader source code

    fragmentShaderCode: `
        precision mediump float;

        varying vec4 v_Color;
        void main(void){
            gl_FragColor = v_Color;
        }`, //the fragment shader source code

    attributes: {
        position: "a_Position",
        color: "a_Color"
    }, //references to attributes variables in the shader
    uniforms: {
        mvpMatrix: "u_MvpMatrix"
    } //references to uniforms variables in the shader
}; //shaders info

let glCanvas; //store the canvas element used by webgl
let gl; //store the webgl rendering context

let vertexShader; //store a webgl shader object that contains the vertex shader
let fragmentShader; //store a webgl shader object that contains the fragment shader
let program; //store a webgl program object that contains a combination of vertex and fragment shader

let verticesPositionBuffer; //store a webgl buffer witch contains the vertex position
let verticesColorBuffer; //store a webgl buffer witch contains the vertex color
let indicesBuffer; //store a webgl buffer witch contains the vertex indice witch form a face

let a_PositionLocation; //store a attribute location;
let a_ColorLocation; //store a attribute location;
let u_MvpMatrixLocation; //store a uniform location;

let modelMatrix; //store a 4x4 matrix
let viewMatrix; //store a 4x4 matrix
let projectionMatrix; //store a 4x4 matrix
let mvpMatrix; //store a 4x4 matrix
let identityMatrix; //store a 4x4 matrix

//run code only when page load
window.addEventListener("load", () => {
    glCanvas = document.getElementById("glCanvas"); //get the canvas element to use webgl

    gl = glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl"); //get the webgl context
    if(!gl){
        alert("webgl not supported, try another browser"); //show an alert
        return;
    } //verify if have a webgl contex
    else{
        initGl();
        initShaders();
        initBuffers();
        initMatrices();

        setupControlls();

        tick();
    }
});

function initGl(){
    gl.clearColor(0.2, 0.4, 0.6, 1.0); //Specify the color for clearing
    gl.enable(gl.DEPTH_TEST); //enable depth test to determines if a polygon is behind another and then hide it
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear the drawing area(color buffer) and depth buffer
}

function initShaders(){
    vertexShader = gl.createShader(gl.VERTEX_SHADER); //create a new webgl shader object
        gl.shaderSource(vertexShader, shader.vertexShaderCode); //passes the vertex shader source code to the vertex shader object
        gl.compileShader(vertexShader); //compile the vertex shader
            if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) //check the compilation status
                console.error("SHADER: failed to compile vertex shader\n", gl.getShaderInfoLog(vertexShader)); //output a error message
            else
                console.log("SHADER: vertex shader compilation successfully"); //output a success message

    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //create a new webgl shader object
        gl.shaderSource(fragmentShader, shader.fragmentShaderCode); //passes the fragment shader source code to the fragment shader object
        gl.compileShader(fragmentShader); //compile the fragment shader
        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) //check the compilation status
            console.error("SHADER: failed to compile fragment shader\n", gl.getShaderInfoLog(fragmentShader)); //output a error message
        else
            console.log("SHADER: fragment shader compilation successfully"); //output a success message

    program = gl.createProgram(); //create a new webgl program object
        gl.attachShader(program, vertexShader); //attach the vertex shader to the shader program
        gl.attachShader(program, fragmentShader) //attach the fragment shader to the shader program
        gl.linkProgram(program); //links program witch have attached vertex and fragment shader to be use in the shader processor
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) //check link status
            console.error("PROGRAM: failed to link program\n", gl.getProgramInfoLog(program)); //output a error message
        else
            console.log("PROGRAM: program has be linked successfully"); //output a success message

    gl.useProgram(program); //use this program in the rendering state
    console.log("PROGRAM: using program"); //output a success message
} //setup the shaders

function initBuffers(){
    verticesPositionBuffer = gl.createBuffer(); //create a buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesPositionBuffer); //bind the buffer object to a target
        gl.bufferData(gl.ARRAY_BUFFER, quadGeometry.verticesPosition, gl.STATIC_DRAW); //write data into the buffer object
        a_PositionLocation = gl.getAttribLocation(program, shader.attributes.position); //get the attribute location
        gl.vertexAttribPointer(a_PositionLocation, quadGeometry.size, gl.FLOAT, false, quadGeometry.stride, quadGeometry.offset); //assign the binded buffer object with especifyed memory layout to the attribute variable
        gl.enableVertexAttribArray(a_PositionLocation); //enable the data assignment to the attribute

    verticesColorBuffer = gl.createBuffer(); //create a buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer); //bind the buffer object to a target
        gl.bufferData(gl.ARRAY_BUFFER, quadGeometry.verticesColor, gl.STATIC_DRAW); //write data into the buffer object
        a_ColorLocation = gl.getAttribLocation(program, shader.attributes.color); //get the attribute location
        gl.vertexAttribPointer(a_ColorLocation, quadGeometry.size, gl.FLOAT, false, quadGeometry.stride, quadGeometry.offset); //assign the binded buffer object with especifyed memory layout to the attribute variable
        gl.enableVertexAttribArray(a_ColorLocation); //enable the data assignment to the attribute

        indicesBuffer = gl.createBuffer(); //create a buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer); //bind the buffer object to a target
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadGeometry.indices, gl.STATIC_DRAW); //write data into the buffer object
} //setup buffers and attributes

function initMatrices(){
    modelMatrix = mat4.create(); //creates a identity matrix
    viewMatrix = mat4.create(); //creates a identity matrix
    projectionMatrix = mat4.create(); //creates a identity matrix
    mvpMatrix = mat4.create(); //creates a identity matrix
    identityMatrix = mat4.create(); //creates a identity matrix

    u_MvpMatrixLocation = gl.getUniformLocation(program, shader.uniforms.mvpMatrix); //get the uniform location
    gl.uniformMatrix4fv(u_MvpMatrixLocation, false, mvpMatrix); //assign data to the uniform
} //setup matrices

function setupControlls(){
    mouseLook.setMouseLook(glCanvas, 0.01);
}

function tick(){
    draw();
    window.requestAnimationFrame(tick);
}

function draw(){
    mat4.translate(modelMatrix, identityMatrix, [movedX, movedY, 0]); //translate the model
    mat4.lookAt(viewMatrix, [ 0, 0, 3], [0, 0, 0], [0, 1, 0]) //tranform the view point
    mat4.perspective(projectionMatrix, 45*(Math.PI/180), glCanvas.clientWidth/glCanvas.clientHeight, 0.1, 1000); //set projection to perspective

    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix); //multiplye a matrix
    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix); //multiplye a matrix

    u_MvpMatrixLocation = gl.getUniformLocation(program, shader.uniforms.mvpMatrix); //get the uniform location
    gl.uniformMatrix4fv(u_MvpMatrixLocation, false, mvpMatrix); //assign data to the uniform



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, quadGeometry.indicesCount, gl.UNSIGNED_SHORT, 0);
} //draw scene