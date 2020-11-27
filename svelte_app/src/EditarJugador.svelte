<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
  const apiURL = "http://127.0.0.1:5000/get_jugador/";
  const apiURL2 = "http://127.0.0.1:5000/get_servidores";
  const apiURL3 = "http://127.0.0.1:5000/update_jugador/";
  const apiURL4 = "http://127.0.0.1:5000/delete_jugador/"

  let data =[];
  let selected;

  let dataServidores = [];
  let nombreJugadorNuevo = "";
  let servidorActual = "";
  import { onMount } from "svelte";
  export let params
  let idJugador = params.ID_Jugador
  onMount(async function() {
         const response = await fetch(apiURL+idJugador);
         let json  = await response.json();
         data = json;
         nombreServidor(data.id_servidor);
         console.log(data)
    });
  
  onMount(async function(){
        const response = await fetch(apiURL2);
        dataServidores  = await response.json();
        console.log(dataServidores)
  });  
  
  function nombreServidor(id_servidor){
    switch(id_servidor) {
      case "BR1":
        servidorActual = "Brasil"
        break;
      case "EUN1":
        servidorActual = "Europa Norte"
        break;
      case "EUW1":
        servidorActual = "Europa Oeste"
        break;
      case "JP1":
        servidorActual = "Japon"
        break;
      case "KR":
        servidorActual = "Korea"
        break;
      case "LA1":
        servidorActual = "Latinoamerica Norte"
        break;
      case "LA2":
        servidorActual = "Latinoamerica Sur"
        break;
      case "NA":
        servidorActual = "Norteamerica"
        break;
      case "OC1":
        servidorActual = "Oceania"
        break;
      case "RU":
        servidorActual = "Rusia"
        break;
      case "TR1":
        servidorActual = "Turquia"
        break;
      default: 
        servidorActual = "Marte"
    }
  }

  
    async function actualizarJugador() {
      if (nombreJugadorNuevo == "")
         nombreJugadorNuevo = data.nombre_jugador
      if (selected=="")
          selected = data.id_servidor

    const response= await fetch(apiURL3+idJugador,{
            method: 'PUT', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": selected,
              "nombre_jugador": nombreJugadorNuevo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/Jugadores";
    console.log(result)
  }


  async function eliminarJugador() {
    const response= await fetch(apiURL4+idJugador,{
            method: 'DELETE'
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/Jugadores";
    console.log(result)
  }

  async function crearJugador() {
    const response= await fetch(apiURLx,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": "OC1",
              "nombre_jugador": "SHANTI DE LA AUSTRALIO"
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    console.log(result)
  }
  

  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, options);
  });
 
</script>
            

<style>
	span {
		color: purple;
		font-family: 'Comic Sans MS', cursive;
		font-size: 2em;
	}
</style>

<svelte:head>
  <!--Import Google Icon Font-->

  <!--Let browser know website is optimized for mobile  <h1>{JSON.stringify(dataServidores)} </h1>
    <button on:click={()=> crearJugador()}>Crear</button>
  -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

</svelte:head>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Jugador</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombreJugadorNuevo} placeholder={data.nombre_jugador} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Invocador</label>
            </div>
          </div>
          
          <div class="container">
            <div class="row input-field col s6 offset">       
                <select style="border-radius: 20px" bind:value={selected} class="browser-default">
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








