class Persona {
    id;
    nombre;
    apellido;
    fechaNacimiento; //Formato: 'YYYY-MM-DD'

    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString() {
        return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de Nacimiento: ${this.fechaNacimiento}`;
    }
}

class Ciudadano extends Persona {
    dni;

    constructor(id, nombre, apellido, edad, dni) {
        super(id, nombre, apellido, edad);
        this.dni = dni;
    }

    toString() {
        return `${super.toString()}, DNI: ${this.dni}`;
    }
}

class Extranjero extends Persona {
    paisOrigen;

    constructor(id, nombre, apellido, edad, paisOrigen) {
        super(id, nombre, apellido, edad);
        this.paisOrigen = paisOrigen;
    }

    toString() {
        return `${super.toString()}, País de Origen: ${this.paisOrigen}`;
    }
}

let personas = [];
let flagAgregar = false;
let flagModificar = false;
let flagEliminar = false;


// Carga de datos en la tabla del index.html

function MostrarPersonasEnLaTabla(personas) {
    const tablaBody = document.querySelector('#tablaEmpleados tbody');
    tablaBody.innerHTML = '';

    personas.forEach(persona => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.fechaNacimiento}</td>
            <td>${persona.dni ?? 'N/A'}</td>
            <td>${persona.paisOrigen ?? 'N/A'}</td>
            <td><button class="modificarBtn" data-id="${persona.id}">Modificar</button></td>
            <td><button class="eliminarBtn" data-id="${persona.id}">Eliminar</button></td>
        `;

        // Agregar eventos para los botones Modificar y Eliminar
        const modificarBtn = row.querySelector('.modificarBtn');
        modificarBtn.addEventListener('click', () => abrirFormularioModificar(persona));

        const eliminarBtn = row.querySelector('.eliminarBtn');
        eliminarBtn.addEventListener('click', () => abrirFormularioEliminar(persona));

        tablaBody.appendChild(row);
    });
}


document.addEventListener("DOMContentLoaded", function() { 
    // const tablaBody = document.querySelector('#tablaEmpleados tbody');
    const xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const empleados = JSON.parse(this.responseText);
            MostrarPersonasEnLaTabla(empleados);
            personas.push(...empleados);

        } else if (this.readyState == 4) {
            alert('Error al obtener la lista: ' + this.status);
        }
    };

    xhttp.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
});

console.log(personas);

// Agregar un evento al botón de agregar
document.getElementById('addElement').addEventListener('click', function(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario, si es necesario
    document.getElementById('container').style.display = 'none';
    document.getElementById('form_container').style.display = 'block';
    // document.getElementById('update').style.display = 'none';
    document.getElementById('lbl_id').style.display = 'none';
    document.getElementById('id').style.display = 'none';
    ResetSelectorTipo();

    //
    flagAgregar = true;
    flagModificar = false;
    flagEliminar = false;

});


// Arreglar eso de id en el agregar elemento porque esta en readonly
// cambio de tipo de persona en el formulario
document.getElementById('tipo_persona').addEventListener('change', function(event) {
    if(event.target.value === 'ciudadano') { 
        document.getElementById('lbl_dni').style.display = 'block';
        document.getElementById('dni').style.display = 'block';
        document.getElementById('lbl_paisOrigen').style.display = 'none';
        document.getElementById('paisOrigen').style.display = 'none';

    } else if(event.target.value === 'extranjero') {
        document.getElementById('lbl_dni').style.display = 'none';
        document.getElementById('dni').style.display = 'none';
        document.getElementById('lbl_paisOrigen').style.display = 'block';
        document.getElementById('paisOrigen').style.display = 'block';
        
    } else {
        ResetSelectorTipo();
    }
});


function ResetSelectorTipo() {
    document.getElementById('lbl_dni').style.display = 'none';
    document.getElementById('dni').style.display = 'none';
    document.getElementById('lbl_paisOrigen').style.display = 'none';
    document.getElementById('paisOrigen').style.display = 'none';
}

document.getElementById('cancel').addEventListener('click', function(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario, si es necesario
    document.getElementById('container').style.display = 'block';
    document.getElementById('form_container').style.display = 'none';
    document.getElementById("tipo_persona").disabled = false;
    ResetSelectorTipo();
    document.getElementById('formulario').reset();
    flagAgregar = false;
    flagModificar = false;
    flagEliminar = false;
    document.getElementById('nombre').disabled = false;
    document.getElementById('apellido').disabled = false;
    document.getElementById('fechaNacimiento').disabled = false;
    document.getElementById('dni').disabled = false;
    document.getElementById('paisOrigen').disabled = false;
});

function convertirFechaNumerica(fecha) {
    // Validar que la fecha tenga exactamente 8 caracteres numéricos
    if (!/^\d{8}$/.test(fecha)) {
        return 'Formato de fecha inválido. Ingrese AAAAMMDD.';
    }

    // Separar la fecha en año, mes y día
    var anio = fecha.substring(0, 4);
    var mes = fecha.substring(4, 6);
    var dia = fecha.substring(6, 8);

    // Construir la fecha en formato numérico y devolverla
    var fechaNumerica = anio + mes + dia;
    return fechaNumerica;
}

document.getElementById('acept').addEventListener('click', function(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario, si es necesario

    let id = document.getElementById('id').value; // Obtener el ID de la persona (para modificar o eliminar)
    let tipo = document.getElementById('tipo_persona').value; // Obtener el tipo de persona (cliente o empleado)
    let fecha = document.getElementById('fechaNacimiento').value;
    let fechaIngresada = convertirFechaNumerica(fecha);
    
    
    if(fechaIngresada === 'Formato de fecha inválido. Ingrese AAAAMMDD.') {
        alert(fechaIngresada);
        return;
    }

    if (flagAgregar === true) {
        // Estás en la operación de agregar persona
        console.log("Agregar persona");
        if (tipo === 'ciudadano') {
            let nuevoCiudadano = {
                id: null,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: fechaIngresada,
                dni: document.getElementById('dni').value
            };
            FinalizarAgregar(nuevoCiudadano);
            MostrarSpinner(); // Mostrar el Spinner al hacer clic en "Aceptar"
        } else if (tipo === 'extranjero') {
            let nuevoExtranjero = {
                id: null,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: fechaIngresada,
                paisOrigen: document.getElementById('paisOrigen').value
            };
            FinalizarAgregar(nuevoExtranjero);
            MostrarSpinner(); // Mostrar el Spinner al hacer clic en "Aceptar"
        } else {
            console.error('Tipo de persona no reconocido:', tipo);
        }
    } 
    else if(flagModificar === true){
        // Estás en la operación de modificar persona
        console.log("Modificar persona");
        let personaActualizada;
        if (tipo === 'ciudadano') {
            personaActualizada = {
                id: id,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                dni: document.getElementById('dni').value
            };
            actualizarPersona(personaActualizada);
        } else if (tipo === 'extranjero') {
            personaActualizada = {
                id: id,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                paisOrigen: document.getElementById('paisOrigen').value
            };
            actualizarPersona(personaActualizada);
        }
        MostrarSpinner(); // Mostrar el Spinner al hacer clic en "Aceptar"
    } 
    else if(flagEliminar === true){
        // Estás en la operación de eliminar persona
        console.log("Eliminar persona con ID:", id);
        eliminarPersona(id);
        MostrarSpinner(); // Mostrar el Spinner al hacer clic en "Aceptar"
    } 
    else {
        console.error('Operación no reconocida');
    }

    console.log('Flag agregar:', flagAgregar);
    console.log('Flag modificar:', flagModificar);
    console.log('Flag eliminar:', flagEliminar);
});


function FinalizarAgregar(nuevoRegistro) {
    flagAgregar = false;
    AgregarPersonaFetch(nuevoRegistro)
        .then(data => {
            // Operación exitosa
            console.log('Registro agregado:', data);
            nuevoRegistro.id = data.id;
            personas.push(nuevoRegistro); // Agregar nuevo registro a la lista
            ResetSelectorTipo();
            document.getElementById('formulario').reset();
            MostrarPersonasEnLaTabla(personas);
            OcultarSpinner(); // Ejemplo de ocultar el spinner después de un tiempo
            OcultarFormularioABM(); // Ocultar el formulario ABM
            MostrarFormularioLista(); // Mostrar el formulario Lista actualizado
        })
        .catch(error => {
            // Error al agregar persona
            console.error('Error al agregar persona:', error);
            OcultarSpinner(); // Ejemplo de ocultar el spinner después de un tiempo
            ResetSelectorTipo();
            OcultarFormularioABM(); // Ocultar el formulario ABM
            MostrarFormularioLista(); // Mostrar el formulario Lista
            MostrarAdvertencia(); // Mostrar advertencia de error
        });
}

async function AgregarPersonaFetch(persona) {
    const response = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(persona) // Convierte el objeto a JSON
    });
    if (!response.ok) {
        throw new Error('Error al agregar persona');
    }
    return await response.json();
}

function MostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'block';
}

function OcultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

function OcultarFormularioABM() {
    // Implementar según la lógica de tu aplicación
    document.getElementById('form_container').style.display = 'none';
}

function MostrarFormularioLista() {
    // Implementar según la lógica de tu aplicación
    document.getElementById('container').style.display = 'block';
}

function MostrarAdvertencia() {
    // Implementar según la lógica de tu aplicación
    alert('No se pudo realizar la operación');
}


//MODIFICAR
function abrirFormularioModificar(persona) {
    flagModificar = true;
    flagAgregar = false;
    flagEliminar = false;
    console.log('Modificar persona:', persona);
    document.getElementById('container').style.display = 'none';

    // Rellenar el formulario ABM con los datos de la persona
    document.getElementById('id').value = persona.id;
    document.getElementById('nombre').value = persona.nombre;
    document.getElementById('apellido').value = persona.apellido;
    document.getElementById('fechaNacimiento').value = persona.fechaNacimiento;
    
    if(persona.dni != null) {
        document.getElementById('dni').value = persona.dni;
        document.getElementById('lbl_dni').style.display = 'block';
        document.getElementById('dni').style.display = 'block';
        document.getElementById("tipo_persona").value = "ciudadano";
        document.getElementById("tipo_persona").disabled = true;
        document.getElementById('lbl_paisOrigen').style.display = 'none';
        document.getElementById('paisOrigen').style.display = 'none';
    } else {
        document.getElementById('paisOrigen').value = persona.paisOrigen;
        document.getElementById("tipo_persona").value = "extranjero";
        document.getElementById("tipo_persona").disabled = true;
        document.getElementById('lbl_dni').style.display = 'none';
        document.getElementById('dni').style.display = 'none';
        document.getElementById('lbl_paisOrigen').style.display = 'block';
        document.getElementById('paisOrigen').style.display = 'block';
    }

    // Mostrar el formulario ABM
    document.getElementById('form_container').style.display = 'block';

    // Asegúrate de manejar la lógica para actualizar la persona cuando se envíe el formulario
    // ...
}

function actualizarPersona(personaActualizada) {
    // Lógica para enviar los datos actualizados al servidor, por ejemplo con fetch
    fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(personaActualizada)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar persona');
        }

        // Verificar si la respuesta es JSON o texto
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json(); // Si es JSON, parsear la respuesta
        } else {
            return response.text(); // Si no es JSON, retornar el texto directamente
        }
    })
    .then(data => {
        // Si la respuesta es texto, simplemente mostrarlo como un mensaje
        console.log("Respuesta del servidor:", data);
        console.log('Persona actualizada:', personaActualizada);
        personas.forEach(persona => {
            if(persona.id == personaActualizada.id) {
                if(personaActualizada.dni != null) {
                    persona.nombre = personaActualizada.nombre;
                    persona.apellido = personaActualizada.apellido;
                    persona.fechaNacimiento = personaActualizada.fechaNacimiento;
                    persona.dni = personaActualizada.dni;
                } else {
                    persona.nombre = personaActualizada.nombre;
                    persona.apellido = personaActualizada.apellido;
                    persona.fechaNacimiento = personaActualizada.fechaNacimiento;
                    persona.paisOrigen = personaActualizada.paisOrigen;
                }
            }
        });
        document.getElementById('formulario').reset();
        document.getElementById("tipo_persona").disabled = false;
        MostrarPersonasEnLaTabla(personas);
        OcultarSpinner();
        OcultarFormularioABM();
        MostrarFormularioLista();
        flagModificar = false;

    })
    .catch(error => {
        console.error('Error en actualizarPersona:', error);
        // Manejo de errores si es necesario
        OcultarSpinner();
        OcultarFormularioABM();
        MostrarFormularioLista();
        MostrarAdvertencia();
        flagModificar = false;
    });
}


//ELIMINAR
function abrirFormularioEliminar(persona) {
    flagEliminar = true;
    flagAgregar = false;
    flagModificar = false;
    console.log('Eliminar persona:', persona);
    document.getElementById('container').style.display = 'none';

    // Rellenar el formulario ABM con los datos de la persona
    document.getElementById('id').value = persona.id;
    document.getElementById('nombre').value = persona.nombre;
    document.getElementById('apellido').value = persona.apellido;
    document.getElementById('fechaNacimiento').value = persona.fechaNacimiento;
    document.getElementById('lbl_id').style.display = 'block';
    document.getElementById('id').style.display = 'block';
    document.getElementById('id').disabled = true;
    document.getElementById('nombre').disabled = true;
    document.getElementById('apellido').disabled = true;
    document.getElementById('fechaNacimiento').disabled = true;
    document.getElementById('dni').disabled = true;
    document.getElementById('paisOrigen').disabled = true;
    
    if(persona.dni != null) {
        document.getElementById('dni').value = persona.dni;
        document.getElementById('lbl_dni').style.display = 'block';
        document.getElementById('dni').style.display = 'block';
        document.getElementById("tipo_persona").value = "ciudadano";
        document.getElementById("tipo_persona").disabled = true;
        document.getElementById('lbl_paisOrigen').style.display = 'none';
        document.getElementById('paisOrigen').style.display = 'none';
    } else {
        document.getElementById('paisOrigen').value = persona.paisOrigen;
        document.getElementById("tipo_persona").value = "extranjero";
        document.getElementById("tipo_persona").disabled = true;
        document.getElementById('lbl_dni').style.display = 'none';
        document.getElementById('dni').style.display = 'none';
        document.getElementById('lbl_paisOrigen').style.display = 'block';
        document.getElementById('paisOrigen').style.display = 'block';
    }

    // Mostrar el formulario ABM
    document.getElementById('form_container').style.display = 'block';

    // Asegúrate de manejar la lógica para eliminar la persona cuando se envíe el formulario
    // ...
}


function eliminarPersona(personaAEliminar) { //personaAEliminar es el ID de la persona a eliminar
    // Lógica para enviar la solicitud de eliminación al servidor
    fetch(`https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: personaAEliminar }) // Convierte el objeto a JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar persona');
        }
        return response.text(); // Asumimos que la respuesta es texto
    })
    .then(data => {
        console.log("Respuesta del servidor:", data);
        console.log('Persona eliminada:', personaAEliminar);

        // Filtrar la persona eliminada de la lista local
        // 
        personas.forEach((persona, index) => {
            if(persona.id == personaAEliminar) {
                personas.splice(index, 1); // Eliminar la persona de la lista
            }
        });

        // Resetear y habilitar los campos del formulario
        document.getElementById('formulario').reset();
        document.getElementById("tipo_persona").disabled = false;
        document.getElementById('nombre').disabled = false;
        document.getElementById('apellido').disabled = false;
        document.getElementById('fechaNacimiento').disabled = false;
        document.getElementById('dni').disabled = false;
        document.getElementById('paisOrigen').disabled = false;

        // Mostrar la tabla actualizada
        MostrarPersonasEnLaTabla(personas);
        OcultarSpinner();
        OcultarFormularioABM();
        MostrarFormularioLista();
        flagEliminar = false;
    })
    .catch(error => {
        console.error('Error en eliminarPersona:', error);
        document.getElementById("tipo_persona").disabled = false;
        document.getElementById('nombre').disabled = false;
        document.getElementById('apellido').disabled = false;
        document.getElementById('fechaNacimiento').disabled = false;
        document.getElementById('dni').disabled = false;
        document.getElementById('paisOrigen').disabled = false;
        document.getElementById('formulario').reset();
        // Manejo de errores si es necesario
        OcultarSpinner();
        OcultarFormularioABM();
        MostrarFormularioLista();
        MostrarAdvertencia();
        flagEliminar = false;
    });
}
