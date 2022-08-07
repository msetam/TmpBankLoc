Imports Newtonsoft.Json
Imports TmpBankService.Models

Namespace Utils

    Public NotInheritable Class JWT

        Public Property Headers As New Dictionary(Of String, String)
        Public Property Body As New Dictionary(Of String, String)
        Public Property Signature As New Dictionary(Of String, String)

        <JsonIgnore>
        Public ReadOnly Property Username As String
            Get
                Return Body("username")
            End Get
        End Property

        Public Function Claims() As RoleType()
            Dim _claims() As RoleType = New RoleType() {}

            Array.ForEach(Body("roles").Split(","), Sub(claimtypeasstring As String)
                                                        ReDim Preserve _claims(_claims.Length)
                                                        _claims(_claims.Length - 1) = Integer.Parse(claimtypeasstring)
                                                    End Sub
            )

            Return _claims
        End Function

        Public Function ToJson() As String
            Return JsonConvert.SerializeObject(Me)
        End Function

    End Class

    Public Module JWTUtils

        Private Const MY_VERY_SECRET_KEY = "very secret verrryyyy"

        ReadOnly Property Headers As New Dictionary(Of String, String) From {{"alg", "SHA256"}, {"typ", "jwt"}}


        Private Function _CreateRoles(claims() As Role) As String

            Dim result As String = ""

            If claims.Length >= 1 Then
                For i As Integer = 0 To claims.Length - 2 Step 1
                    result += Convert.ToInt32(claims(i).RoleValue).ToString() + ","
                Next
                result += Convert.ToInt32(claims(claims.Length - 1).RoleValue).ToString()
                Return result
            End If

            Return Convert.ToInt32(RoleType.ANONYMOUS)
        End Function

        Private Function _CreateRoles(claims() As RoleType) As String

            Dim result As String = ""

            If claims.Length >= 1 Then
                For i As Integer = 0 To claims.Length - 2 Step 1
                    result += Convert.ToInt32(claims(i)).ToString() + ","
                Next
                result += Convert.ToInt32(claims(claims.Length - 1)).ToString()
                Return result
            End If

            Return Convert.ToInt32(RoleType.ANONYMOUS)
        End Function

        Public Function CreateJWT(username As String, calims() As Role) As JWT
            Using cryptoUtil As New CryptographyUtils
                Dim body = New Dictionary(Of String, String) From {{"sub", "identity"}, {"roles", _CreateRoles(calims)}, {"username", username}}
                Return New JWT() With {
                     .Headers = Headers,
                     .Body = body,
                     .Signature = New Dictionary(Of String, String) From {{"sig", cryptoUtil.GenerateSaltedHash(Headers.ToString() + body.ToString(), MY_VERY_SECRET_KEY, False)}}
                    }
            End Using

        End Function

        Public Function CreateJWT(username As String, calims() As RoleType) As JWT
            Using cryptoUtil As New CryptographyUtils
                Dim body = New Dictionary(Of String, String) From {{"sub", "identity"}, {"roles", _CreateRoles(calims)}, {"username", username}}
                Return New JWT() With {
                     .Headers = Headers,
                     .Body = body,
                     .Signature = New Dictionary(Of String, String) From {{"sig", cryptoUtil.GenerateSaltedHash(Headers.ToString() + body.ToString(), MY_VERY_SECRET_KEY, False)}}
                    }
            End Using

        End Function

        Public Function IsJwtValid(jwt As JWT) As Boolean
            Return jwt IsNot Nothing AndAlso String.Compare(jwt.Signature("sig"), CreateJWT(jwt.Username, jwt.Claims).Signature("sig")) = 0
        End Function

    End Module

End Namespace