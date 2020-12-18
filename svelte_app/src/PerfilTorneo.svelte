<script>
  import { onMount } from "svelte";
  export let params

  let idTorneo = params.ID_torneo // para las url de la api
  const apiURLGetEquisTorneo = "http://127.0.0.1:5000/get_equis_torneo/"; // equipos de un torneo
  const apiURLGetEquipo = "http://127.0.0.1:5000/get_equipo/"; // datos de un equipo


  const apiURLGetEquistorneoPartida = "http://127.0.0.1:5000/get_equis_torneo_partidas/"; // trae todas las partidas de un torneo con sus equipos
  const apiURLGetPartida= "http://127.0.0.1:5000/get_partida/"; // obtener partida
  const apiURLDelEquiTorneo = "http://127.0.0.1:5000/delete_equi_torneo/";  // borrar un equipo de un torneo
  const apiURLDelPartida = "http://127.0.0.1:5000/delete_partida/"; //borrar una partida

  const apiURLDelEquiTorneoPartida="http://127.0.0.1:5000/delete_equi_torneo_partida/" // borrar una partida de un torneo con el equipo que la jugo (1 solo) se hace 2 veces
  let dataEquiposTorneo = [];
  //let dataEquiposTorneo = [];
  




  
  let dataMatches = [];
    onMount(async function() { // trae los equipos de un torneo
        let dataEquiposTorneoAux =[];
        const response = await fetch(apiURLGetEquisTorneo+idTorneo);
        let jsonEquiposTorneo  = await response.json(); // json tiene la relacion de equitorneo(id equipo y id torneo)
        for(let i = 0; i < jsonEquiposTorneo.length; i++) { // por cada iteracion traemos los datos de un equipo...
          const response2 = await fetch(apiURLGetEquipo+jsonEquiposTorneo[i].id_equipo);
          let json2  = await response2.json();
          dataEquiposTorneoAux.push(json2); // metemos un equipo al vector de equipos
        } 
        dataEquiposTorneo = dataEquiposTorneoAux; // svelte no reacciona push.....
    });
    
    onMount(async function() {
      let dataMatchesAux= [];
      const response = await fetch(apiURLGetEquistorneoPartida+idTorneo); // traemos las partidas de los equipos en 1 torneo 
      let dataEquiposTorneoPartida  = await response.json(); // response tiene la relacion equitornepartida (id_torneo,id_equipo,id_partida)
      dataEquiposTorneoPartida.sort(GetSortOrder("id_partida"));// ordenar por id partida para poder tomar de a pares
      console.log(dataEquiposTorneoPartida);
      for(let i = 0; i < dataEquiposTorneoPartida.length; i = i+2) { // una partida tiene 2 equipos por eso, hacemos un for que recorre el json de a pares 
        let dataMatchAux = {}; // creamos un json que va a tener todos los datos de una partida( sus equipos y su resultado)
        const respuestaEquipo1 = await fetch(apiURLGetEquipo+dataEquiposTorneoPartida[i].id_equipo); // obtener datos equipo 1 
        let jsonEquipo1  = await respuestaEquipo1.json();
        //console.log(jsonEquipo1);//equipo 1  
        const respuestaEquipo2 = await fetch(apiURLGetEquipo+dataEquiposTorneoPartida[i+1].id_equipo); // obtener datos equipo 2
        let jsonEquipo2  = await respuestaEquipo2.json();
        //console.log(jsonEquipo2);//equipo 2  
        const respuestaPartida = await fetch(apiURLGetPartida+dataEquiposTorneoPartida[i].id_partida);
        let jsonPartida =  await respuestaPartida.json(); // armamos nuestro json con lo que necesitamos...
        dataMatchAux.id_partida= jsonPartida.id_partida;
        dataMatchAux.resultado_partida = jsonPartida.resultado_partida;
        dataMatchAux.id_equipo1 = jsonEquipo1.id_equipo;
        dataMatchAux.equipo1 = jsonEquipo1.nombre_equipo;
        dataMatchAux.equipo2 = jsonEquipo2.nombre_equipo;
        dataMatchAux.id_equipo2 = jsonEquipo2.id_equipo;
        dataMatchesAux.push(dataMatchAux);
       
      } 
      dataMatches = dataMatchesAux; // svelte no reacciona a push...
    });

    function GetSortOrder(prop) {    // es para ordenar un array de json con (id_partida)
      return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
      }    
    }

    async function desinscribirEquipoTorneo(p_idEquipo) {
      const response= await fetch(apiURLDelEquiTorneo+p_idEquipo+"/"+idTorneo,{
            method: 'DELETE' 
            });  
      //const json = await response.json()
      //let result = JSON.stringify(json)
      location.reload();
      //console.log(result)
    }

    

    async function BorrarPartidaEquipoTorneo(p_idPartida,p_equipo1,p_equipo2) {
      eliminarEquiTornePartida(p_idPartida,p_equipo1);// eliminar la partida con el equipo 1
      eliminarEquiTornePartida(p_idPartida,p_equipo2);// eliminar la partida con el equipo 2
      eliminarPartida(p_idPartida); 
      location.reload();
    }

    async function eliminarPartida(p_idPartida) { // elimina la partida de la tabla partidas
      const response= await fetch(apiURLDelPartida+p_idPartida,{
              method: 'DELETE'
          });
      //const json = await response.json()
      //let result = JSON.stringify(json)
      //console.log(result)
    }

    async function eliminarEquiTornePartida(p_idPartida, p_idEquipo){ // elimina la relacion equipo torneo partida
      const response= await fetch(apiURLDelEquiTorneoPartida+p_idEquipo+"/"+idTorneo+"/"+p_idPartida,{
              method: 'DELETE'
          });
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
    }

</script>

<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
  <div class="container" style="padding-top:7%">  
    <table class="highlight centered ">
      <thead class="blue darken-1 white-text">
        <tr>
          <th>Equipo</th>
          <th></th>
        </tr>
      </thead>
      <tbody style = "background: rgba(0,0,0,0.5);">
        {#each dataEquiposTorneo as row}
          <tr>
          <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo}">{row.nombre_equipo}</a></td>
          <td><a href="/#/PerfilTorneo/{idTorneo}" on:click={()=> desinscribirEquipoTorneo(row.id_equipo)}><i class="material-icons left blue-text">delete</i></a></td>
          </tr>
        {/each}
      </tbody>
    
      </table>
      <a href="/#/NuevoEquipoTorneo/{idTorneo}" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
  
      <div style="padding-top:2%">
        <table class="highlight centered ">
          <thead class="blue darken-1 white-text">
            <tr>
              <th >Resultado</th>
              <th >Equipo 1</th>
              <th >Equipo 2</th>
              <th></th>
            </tr>
          </thead>
          <tbody style = "background: rgba(0,0,0,0.5);">
            {#each dataMatches as row}
              <tr>
              <td class="blue-text">{row.resultado_partida}</td>
              <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo1}">{row.equipo1}</a></td> 
              <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo2}">{row.equipo2}</a></td>
              <td>
                <a href="/#/EditarPartida/{row.id_partida}"><i class="material-icons left blue-text">edit</i></a>
                <a href="#0" on:click={()=> BorrarPartidaEquipoTorneo(row.id_partida,row.id_equipo1,row.id_equipo2)}><i class="material-icons left blue-text ">delete</i></a>
              </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <a href="/#/NuevoEquipoTorneoPartida/{idTorneo}" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
  </div>
</body>
              








