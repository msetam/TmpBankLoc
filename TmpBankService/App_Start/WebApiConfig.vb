Imports System.Web.Http

Namespace Config

    Public Class WebApiConfig

        Public Const API_PREFIX = "api"

        Public Shared Sub Register(config As HttpConfiguration)
            config.Routes.MapHttpRoute(name:="UserApi", routeTemplate:=API_PREFIX + "/{controller}/{action}/{id}",
                              defaults:=New With {.id = RouteParameter.Optional})
            config.MapHttpAttributeRoutes()
        End Sub



    End Class

End Namespace