const ventas=document
.getElementById("ventasChart");

new Chart(ventas,{

    type:"bar",

    data:{

        labels:["Ventas"],

        datasets:[{

            label:"Total",

            data:[
                datos.ventas
            ]

        }]

    }

});

const productos=document
.getElementById("productosChart");

new Chart(productos,{

    type:"pie",

    data:{

        labels:datos.top_productos.map(

            p=>p.nombre

        ),

        datasets:[{

            data:datos.top_productos.map(

                p=>p.cantidad

            )

        }]

    }

});