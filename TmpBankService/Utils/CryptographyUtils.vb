Imports System.Security.Cryptography


Namespace Utils
    Public Class CryptographyUtils
        Implements IDisposable

        Private _RngProver As RNGCryptoServiceProvider = New RNGCryptoServiceProvider()
        Private _SHAManager As SHA256Managed = New SHA256Managed()

        Public Function GenerateSaltedHash(data As String, salt As String, Optional appendSalt As Boolean = True) As String
            data = data + salt
            ' convert pw+salt to bytes:
            Dim saltyPW = Encoding.UTF8.GetBytes(data)
            ' hash the pw+salt bytes:
            Dim hBytes = _SHAManager.ComputeHash(saltyPW)
            ' return a B64 string so it can be saved as text 
            If appendSalt Then
                Return salt & ":" & Convert.ToBase64String(hBytes)
            End If
            Return Convert.ToBase64String(hBytes)
        End Function

        Public Function CreateNewSalt(Optional size As Integer = 10) As String
            ' use the crypto random number generator to create
            ' a new random salt 
            ' dont allow very small salt
            Dim data(If(size < 7, 7, size)) As Byte
            ' fill the array
            _RngProver.GetBytes(data)
            ' convert to B64 for saving as text
            Return Convert.ToBase64String(data)

        End Function

        Public Shared Function CompareHash(inputText As String, hashedValue As String, hashSalt As String) As Boolean
            Dim crypyoManager As New CryptographyUtils()
            Dim hashedInput = crypyoManager.GenerateSaltedHash(inputText, hashSalt)
            Return String.Compare(hashSalt & hashedValue, hashedInput, False) = 0
        End Function


        Public Sub Dispose() Implements IDisposable.Dispose
            If _SHAManager IsNot Nothing Then
                _SHAManager.Dispose()
                _SHAManager = Nothing
            End If
            If _RngProver IsNot Nothing Then
                _RngProver.Dispose()
                _RngProver = Nothing
            End If

        End Sub


    End Class

End Namespace
