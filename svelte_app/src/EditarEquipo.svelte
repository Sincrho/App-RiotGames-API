<script>
  import { onMount } from "svelte";
  export let params
  const apiURLGetEquipos = "http://127.0.0.1:5000/get_equipo/";
  const apiURLUpdEquipos = "http://127.0.0.1:5000/update_equipo/";
  const apiURLDelEquipos = "http://127.0.0.1:5000/delete_equipo/";

  let dataEquipo =[];
  let nombreEquipoNuevo = ""; 
  let idEquipo = params.ID_Equipo; // idEquipo para los links 
  
  onMount(async function() {
         const response = await fetch(apiURLGetEquipos+idEquipo);
         let json  = await response.json();
         dataEquipo = json;
         //console.log(dataEquipo)
  }); 

  async function actualizarEquipo() {
    if (nombreEquipoNuevo =="")
      nombreEquipoNuevo=dataEquipo.nombre_equipo
    const response= await fetch(apiURLUpdEquipos+idEquipo,{
            method: 'PUT', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": null,
              "nombre_equipo": nombreEquipoNuevo
            })
        });
    location.href = "/#/Equipos";   
    //const json = await response.json()
    
    //let result = JSON.stringify(json)
    //console.log(result)
    
  }


  async function eliminarEquipo() {
    const response= await fetch(apiURLDelEquipos+idEquipo,{
            method: 'DELETE'
        });
    location.href = "/#/Equipos";
    //const json = await response.json()
    //let result = JSON.stringify(json)
    //console.log(result)
  }
</script>
  
       
              



<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <!--head de card-->
        <div class="card-content black-text" >
          <span class="card-title center" style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Equipo</span>
        </div>
         <!--body de card-->
        <div class="card-action">
          <div class ="container">
            <div class="row input-field">
              <input id ="nombre_equipo" style="border-radius: 20px" bind:value={nombreEquipoNuevo} placeholder={dataEquipo.nombre_equipo} class="white validate black-text">
              <label class="active" for="nombre_equipo">Nombre Equipo</label>
            </div>
          </div>

          <div class = "container">
              <button class ="waves-effect waves-light btn blue darken-1" on:click={()=> actualizarEquipo()}><i class="material-icons left ">check_circle</i>Confirmar</button>
              <button class ="waves-effect waves-light btn  blue darken-1" on:click={()=> eliminarEquipo()}><i class="material-icons left ">delete</i>Eliminar</button>
          </div>    

        </div>
      </div>
    </div>
  </div>
</body>




  