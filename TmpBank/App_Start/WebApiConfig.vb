Imports System.Web.Http

Public Class WebApiConfig
    Public Shared Sub Register(config As HttpConfiguration)
        config.MapHttpAttributeRoutes()
        config.Routes.MapHttpRoute(name:="UserApi", routeTemplate:="api/{controller}/{id}",
                              defaults:=New With {.id = RouteParameter.Optional})
    End Sub
End Class
