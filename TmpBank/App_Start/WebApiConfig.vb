Imports System.Web.Http

Public Class WebApiConfig
    Public Shared Sub Register(config As HttpConfiguration)
        config.Routes.MapHttpRoute(name:="UserApi", routeTemplate:="api/{controller}/{id}",
                              defaults:=New With {.id = RouteParameter.Optional})
        config.MapHttpAttributeRoutes()

    End Sub
End Class
