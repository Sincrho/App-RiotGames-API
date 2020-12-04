<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
  export let params
  import { onMount } from "svelte";

  const apiURL = "http://127.0.0.1:5000/get_perfil/";
  let dataPerfil =[];
  let parametros = [];
  let txt = params.ID_Servidor;
  let roww = 0;  
  parametros = txt.split("*");
  


  onMount(async function() {
           const response = await fetch(apiURL+parametros[0]+"/"+parametros[1]);
           let json  = await response.json();
           dataPerfil = JSON.parse(json);
           console.log(dataPerfil)
      });
      
    
  function obtenerImagen(rango){
    console.log("renzo se la come")
    let ImagenRango="";
    switch(rango) {
      case "IRON":
        ImagenRango = "https://i.imgur.com/dONSpQ1.png"
        break;
      case "BRONZE":
        ImagenRango = "https://i.imgur.com/OO2iZ5e.png"
        break;
      case "SILVER":
        ImagenRango = "https://i.imgur.com/K6Egl6R.png"
        break;
      case "GOLD":
        ImagenRango = "https://i.imgur.com/2oJvJ30.png"
        break;
      case "PLATINUM":
        ImagenRango = "https://i.imgur.com/axJyRwY.png"
        break;
      case "DIAMOND":
        ImagenRango = "https://i.imgur.com/V7fWTbS.png"
        break;
      case "MASTER":
        ImagenRango = "https://i.imgur.com/G9iX9pf.png"
        break;
      case "GRANDMASTER":
        ImagenRango = "https://i.imgur.com/MAQhZJI.png"
        break;
      case "CHALLENGER":
        ImagenRango = "https://i.imgur.com/QcvJWlV.png"
        break;
      default: 
        ImagenRango = ":("
    }
    //console.log(roww);
    roww = roww+1

    return ImagenRango;

  }
  

</script>

<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container">
    
      <div class=" card blue-grey lighten-5" >
     
        <div class="card-content " style = "background: rgba(0,0,0,0.5);" >
         <h1>{parametros[1]} </h1>
        </div>
        

        <div class = "row"   style = "background: rgba(0,0,0,0.5);">
          <div class="col s2">
          </div>

         {#each dataPerfil as perfil }
          
             <div class = "container col s4">
               <img src={obtenerImagen(perfil.tier)}>
             </div>
         {/each}
       </div>

    
        <div style = "background: rgba(0,0,0,0.5);" class="card-content" >
          <div class ="row " >
            <div class="col s3">
            </div>
          

            {#each dataPerfil as perfil }
              <div class="col s4" >
                <span align="center" class="centered flow-text">{"Rango: "+perfil.tier +"   "+ perfil.rank+"\n"}</span>
              </div>
            {/each}
          </div> 

          <div class= "row ">
            <div class="col s3">
            </div>
           
              {#each dataPerfil as perfil }
                <div class="col s4">
                  <span align="center" class="centered flow-text">{"Wins: "+perfil.wins +"   "+"Losses:  " +perfil.losses+"\n"}</span>
                </div>
              {/each}

          </div> 
          
        </div>
      </div>
   
  </div>
</body>










