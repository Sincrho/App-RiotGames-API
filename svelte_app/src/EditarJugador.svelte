<script>
  import { onMount } from "svelte";
  export let params
  
  const apiURLGetJugador = "http://127.0.0.1:5000/get_jugador/";
  const apiURLGetServidores = "http://127.0.0.1:5000/get_servidores";
  const apiURLUpdJugador = "http://127.0.0.1:5000/update_jugador/";
  const apiURLDelJugador = "http://127.0.0.1:5000/delete_jugador/"
  const apiURLGetServidor = "http://127.0.0.1:5000/get_servidor/"
  let dataJugador =[];
  let servidorSelected;

  let dataServidores = [];
  let nombreJugadorNuevo = "";
  let servidorActual = "";

  let idJugador = params.ID_Jugador;

  onMount(async function() {
         const response = await fetch(apiURLGetJugador+idJugador);
         let json  = await response.json();
         dataJugador = json;
         nombreServidor(dataJugador.id_servidor); // paso el id servidor para obtener el NOMBRE del servidor actual
         //console.log(dataJugador)
    });
  
  onMount(async function(){
        const response = await fetch(apiURLGetServidores);
        dataServidores  = await response.json();
        //console.log(dataServidores)
  });  
  
  async function nombreServidor(id_servidor){
      const response = await fetch(apiURLGetServidor+id_servidor);
      let dataServidor  = await response.json();
      servidorActual = dataServidor.region_servidor
  }

  
  async function actualizarJugador() {
    if (nombreJugadorNuevo == "") // si no actualizo el nombre, se setea el nombre anterior para no hacer un actualizar con vacion y perder el valor
       nombreJugadorNuevo = dataJugador.nombre_jugador
    if (servidorSelected=="") // SAME que arriba
        servidorSelected = dataJugador.id_servidor
        
    const response= await fetch(apiURLUpdJugador+idJugador,{
            method: 'PUT', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": servidorSelected,
              "nombre_jugador": nombreJugadorNuevo
            })
        });
    location.href = "/#/Jugadores";
    //const json = await response.json()
    //let result = JSON.stringify(json)
    //console.log(result)
  }


  async function eliminarJugador() {
    const response= await fetch(apiURLDelJugador+idJugador,{
            method: 'DELETE'
        });
    location.href = "/#/Jugadores";
    //const json = await response.json()
    //let result = JSON.stringify(json)
    //console.log(result)
  }
</script>
            
<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text" >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Jugador</span>
        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field">
            <input style="border-radius: 20px" bind:value={nombreJugadorNuevo} placeholder={dataJugador.nombre_jugador} id="nombre_jugador" type="text" class="white validate black-text">
              <label  class="active " for="nombre_jugador">Nombre Jugador</label>
            </div>
          </div>
          
          <div class="container">
            <div class="row input-field">       
                <select style="border-radius: 20px" bind:value={servidorSelected} class="browser-default">
                  <option value="" disabled selected>{servidorActual}</option>
                  {#each dataServidores as servidor }
                  <option value={servidor.id_servidor}>{servidor.region_servidor}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Nombre Servidor</label>
              </div>
          </div>

          <div class = "container">    
              <button href="/#/Jugadores" class ="waves-effect waves-light btn  blue darken-1" on:click={()=> actualizarJugador()}><i class="material-icons left ">check_circle</i>Confirmar</button>
              <button href="/#/Jugadores" class ="waves-effect waves-light btn blue darken-1" on:click={()=> eliminarJugador()}><i class="material-icons left ">delete</i>Eliminar</button>
          </div>    

        </div>
      </div>
    </div>
  </div>
  
</body>








