
<script>
  import { onMount } from "svelte";
  const apiURL = "http://127.0.0.1:5000/get_equis_torneo/";
  const apiURL1 = "http://127.0.0.1:5000/get_equipo/";
  const apiURL2 = "http://127.0.0.1:5000/add_partida";
  const apiURL3=  "http://127.0.0.1:5000/add_equi_torneo_partida";

  export let params;
  let idTorneo = params.ID_Torneo;

  let dataEquiposTorneo = [];
  let dataEquiposAux= [];
  let dataEquipos=[];

  let selectedEquipo1;
  let selectedEquipo2;
  let resultadoPartida;
  onMount(async function() {                 
    const response = await fetch(apiURL+idTorneo);
    let json  = await response.json();
    dataEquiposTorneo = json;
    console.log(dataEquiposTorneo);
    //console.log(dataEquiposTorneo.length);
    for(let i = 0; i < dataEquiposTorneo.length; i++) {
      const response2 = await fetch(apiURL1+dataEquiposTorneo[i].id_equipo);
      let json2  = await response2.json();
      dataEquiposAux.push(json2);
  } 
    dataEquipos = dataEquiposAux; // svelte no reacciona push.....
    console.log(dataEquipos);
  });
  async function insertarPartidaTorneo() {

    if (selectedEquipo1 != selectedEquipo2){
      const partida=JSON.parse (await crearPartida());
      
      const response= await fetch(apiURL3,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": selectedEquipo1,
              "id_torneo": idTorneo,
             "id_partida": partida.id_partida
           })
       });
      const json1 = await response.json()
     const response2= await fetch(apiURL3,{
         method: 'POST', 
         headers: {'Content-Type' : 'application/json'},
         body:JSON.stringify({
           "id_equipo": selectedEquipo2,
           "id_torneo": idTorneo,
           "id_partida": partida.id_partida
         })
      });
      const json2 = await response2.json()
      console.log(json1);
      console.log(json2);

    }
    else
      console.log("Son iguales culiau");

        
  }

  async function crearPartida() {
    console.log(resultadoPartida);
    const response= await fetch(apiURL2,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_partida": null,
              "resultado_partida": resultadoPartida
            })
        });
    const json = await response.json()
    console.log(json);
    return json;
  }  

</script>








<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Inserte una partida al torneo</span>

        </div>
        <div class="card-action">
          <div class="container">

              <div class="row input-field col s6 offset">       
                <select  bind:value={selectedEquipo1} class="browser-default">
                  <option value="" disabled selected>Equipos</option>
                  {#each dataEquipos as equipo }
                  <option value={equipo.id_equipo}>{equipo.nombre_equipo}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Equipo 1</label>
              </div>

              <div class="row input-field col s6 offset">       
                <select  bind:value={selectedEquipo2} class="browser-default">
                  <option value="" disabled selected>Equipos</option>
                  {#each dataEquipos as equipo }
                  <option value={equipo.id_equipo}>{equipo.nombre_equipo}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Equipo 2</label>
              </div>  

              <div class="row input-field col s6 offset ">
                <input style="border-radius: 15px" bind:value={resultadoPartida} placeholder="Por Determinar" id="first_name" type="text" class="white validate black-text">
                  <label  class="active " for="first_name ">Resultado</label>
              </div>
          </div>
          <a style="color:white" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> insertarPartidaTorneo()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>

          <div class = "container">
          </div>
        </div>
      </div>
    </div>
  </div>
</body>