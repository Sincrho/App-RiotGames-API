<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">

    const apiURL = "http://127.0.0.1:5000/get_equipo/";

    const apiURL2 = "http://127.0.0.1:5000/update_equipo/";

    const apiURL3 = "http://127.0.0.1:5000/delete_equipo/"

    const apiURLx = "http://127.0.0.1:5000/add_equipo"

    let dataEquipo =[];
  
    let nombreEquipoNuevo = "";


    import { onMount } from "svelte";
    export let params
    
    let idEquipo = params.ID_Equipo
    console.log(idEquipo)
    
    onMount(async function() {
           const response = await fetch(apiURL+idEquipo);
           let json  = await response.json();
           dataEquipo = json;
           console.log(dataEquipo)
      }); 
  
    async function actualizarEquipo() {

      if (nombreEquipoNuevo =="")
        nombreEquipoNuevo=dataEquipo.nombre_equipo

      const response= await fetch(apiURL2+idEquipo,{
              method: 'PUT', 
              headers: {'Content-Type' : 'application/json'},
              body:JSON.stringify({
                "id_equipo": null,
                "nombre_equipo": nombreEquipoNuevo
              })
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
      location.href = "/#/Equipos";
    }
  
  
    async function eliminarEquipo() {
      const response= await fetch(apiURL3+idEquipo,{
              method: 'DELETE'
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
      location.href = "/#/Equipos";
    }
  
    async function crearEquipo() {
      const response= await fetch(apiURLx,{
              method: 'POST', 
              headers: {'Content-Type' : 'application/json'},
              body:JSON.stringify({
                "id_equipo": null,
                "nombre_equipo": "SHANTI DE LA AUSTRALIO"
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
    <!--Let browser know website is optimized for mobile-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Equipo</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombreEquipoNuevo} placeholder={dataEquipo.nombre_equipo} class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Equipo</label>
            </div>
          </div>
          <div class = "container">    
              <button href="/#/Jugadores" class ="waves-effect waves-light btn blue darken-1" on:click={()=> actualizarEquipo()}><i class="material-icons left ">check_circle</i>Confirmar</button>
              <button href="/#/Jugadores" class ="waves-effect waves-light btn  blue darken-1" on:click={()=> eliminarEquipo()}><i class="material-icons left ">delete</i>Eliminar</button>
          </div>    

        </div>
      </div>
    </div>
  </div>
</body>
