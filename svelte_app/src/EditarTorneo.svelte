<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
    const apiURL = "http://127.0.0.1:5000/get_torneo/";

    const apiURL2 = "http://127.0.0.1:5000/update_torneo/";

    const apiURL3 = "http://127.0.0.1:5000/delete_torneo/"

    const apiURLx = "http://127.0.0.1:5000/add_torneo"

    let dataTorneo =[];
  
    let nombreTorneoNuevo = "";


    import { onMount } from "svelte";
    export let params
    
    let idTorneo = params.ID_Torneo
    
    onMount(async function() {
           const response = await fetch(apiURL+idTorneo);
           let json  = await response.json();
           dataTorneo = json;
           console.log(dataTorneo)
      }); 
  
    async function actualizarTorneo() {
      if (nombreTorneoNuevo=="")
        nombreTorneoNuevo= dataTorneo.nombre_torneo
      const response= await fetch(apiURL2+idTorneo,{
              method: 'PUT', 
              headers: {'Content-Type' : 'application/json'},
              body:JSON.stringify({
                "id_torneo": null,
                "nombre_torneo": nombreTorneoNuevo
              })
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
      location.href = "/#/Torneos";
    }
  
  
    async function eliminarTorneo() {
      const response= await fetch(apiURL3+idTorneo,{
              method: 'DELETE'
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
      location.href = "/#/Torneos";
    }
  
    async function crearTorneo() {
      const response= await fetch(apiURLx,{
              method: 'POST', 
              headers: {'Content-Type' : 'application/json'},
              body:JSON.stringify({
                "id_torneo": null,
                "nombre_torneo": "SHANTI DE LA AUSTRALIO"
              })
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
    }   
</script>
  
       
              
<svelte:head>
    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!--Import materialize.css-->
    <link type="text/css" rel="stylesheet" href="css/materialize.min.css"  media="screen,projection"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <!--Let browser know website is optimized for mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>

<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Torneo</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombreTorneoNuevo} placeholder={dataTorneo.nombre_torneo} class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Torneo</label>
            </div>
          </div>
          <div class = "container">    
              <button href="/#/Jugadores" class ="waves-effect waves-light btn  blue darken-1" on:click={()=> actualizarTorneo()}><i class="material-icons left ">check_circle</i>Confirmar</button>
              <button href="/#/Jugadores" class ="waves-effect waves-light btn  blue darken-1" on:click={()=> eliminarTorneo()}><i class="material-icons left ">delete</i>Eliminar</button>
         
          </div>    

        </div>
      </div>
    </div>
  </div>
</body>
