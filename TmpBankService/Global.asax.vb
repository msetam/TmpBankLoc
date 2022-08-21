Imports System.Data.Entity
Imports System.Web.Http
Imports Newtonsoft.Json.Serialization
Imports TmpBankService
Public Class Global_asax
    Inherits HttpApplication

    Sub Application_Start(sender As Object, e As EventArgs)
        System.Diagnostics.Debug.WriteLine("initializing service")
        TmpBankService.Service.Init()
        GlobalConfiguration.Configuration.EnableCors()
        Config.WebApiConfig.Register(GlobalConfiguration.Configuration)
        GlobalConfiguration.Configuration.EnsureInitialized()
        GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.ContractResolver = New DefaultContractResolver()
    End Sub

    Protected Sub Application_PostAuthenticateRequest(sender As Object, e As EventArgs) Handles Me.PostAuthenticateRequest
        System.Web.HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required)
    End Sub
End Class