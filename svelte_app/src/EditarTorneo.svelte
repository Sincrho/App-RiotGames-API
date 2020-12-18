<script>
  import { onMount } from "svelte";
  export let params
  
  const apiURLGetTorneo = "http://127.0.0.1:5000/get_torneo/";
  const apiURLUpdTorneo = "http://127.0.0.1:5000/update_torneo/";
  const apiURLDelTorneo = "http://127.0.0.1:5000/delete_torneo/"

  let dataTorneo =[];

  let nombreTorneoNuevo = "";  
  let idTorneo = params.ID_Torneo; // para las urls de la api
    
    onMount(async function() {
           const response = await fetch(apiURLGetTorneo+idTorneo);
           let json  = await response.json();
           dataTorneo = json;
           //console.log(dataTorneo)
      }); 
  
    async function actualizarTorneo() {
      if (nombreTorneoNuevo=="")
        nombreTorneoNuevo= dataTorneo.nombre_torneo // para que si es vacio no actualice again con vacio y queremos el gris 
      const response= await fetch(apiURLUpdTorneo+idTorneo,{
              method: 'PUT', 
              headers: {'Content-Type' : 'application/json'},
              body:JSON.stringify({
                "id_torneo": null,
                "nombre_torneo": nombreTorneoNuevo
              })
          });
      location.href = "/#/Torneos";
      //const json = await response.json()
      //let result = JSON.stringify(json)
      //console.log(result)
    }
  
  
    async function eliminarTorneo() {
      const response= await fetch(apiURLDelTorneo+idTorneo,{
              method: 'DELETE'
          });
      location.href = "/#/Torneos";
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
          <span class="card-title center" style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Torneo</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field">
            <input id="nombre_torneo" style="border-radius: 20px" bind:value={nombreTorneoNuevo} placeholder={dataTorneo.nombre_torneo} class="white validate black-text">
              <label  class="active " for="nombre_torneo">Nombre Torneo</label>
            </div>
          </div>
          <div class = "container">    
              <button class ="waves-effect waves-light btn  blue darken-1" on:click={()=> actualizarTorneo()}><i class="material-icons left ">check_circle</i>Confirmar</button>
              <button class ="waves-effect waves-light btn  blue darken-1" on:click={()=> eliminarTorneo()}><i class="material-icons left ">delete</i>Eliminar</button>
         
          </div>    

        </div>
      </div>
    </div>
  </div>
</body>
