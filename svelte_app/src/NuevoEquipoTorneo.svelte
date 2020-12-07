
<script>
  import { onMount } from "svelte";
  const apiURL1 = "http://127.0.0.1:5000/get_equipos";
  const apiURL2=  "http://127.0.0.1:5000/add_equi_torneo";

  export let params;
  let idTorneo = params.ID_Torneo;
  let dataEquipos = [];
  let selected;
  let nombreJugadorNuevo = "";

  onMount(async function(){
        const response = await fetch(apiURL1);
        dataEquipos  = await response.json();
        console.log(dataEquipos)
  });  

  async function inscribirEquipoTorneo() {
    const response= await fetch(apiURL2,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": selected,
              "id_torneo": idTorneo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/PerfilTorneo/"+idTorneo;
    console.log(result)
  
  }
</script>







<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Inscribir Equipo a Torneo</span>

        </div>
        <div class="card-action">
          <div class="container">
            <div class="row input-field col s6 offset">       
                <select  bind:value={selected} class="browser-default">
                  <option value="" disabled selected>Equipos</option>
                  {#each dataEquipos as equipo }
                  <option value={equipo.id_equipo}>{equipo.nombre_equipo}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Nombre Equipo</label>
              </div>
          </div>
          <div class = "container">
            <a style="color:white" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> inscribirEquipoTorneo()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>
        </div>
        </div>
      </div>
    </div>
  </div>
</body>