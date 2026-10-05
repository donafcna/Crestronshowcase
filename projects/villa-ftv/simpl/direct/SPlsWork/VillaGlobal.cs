using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Linq;
using Crestron;
using Crestron.Logos.SplusLibrary;
using Crestron.Logos.SplusObjects;
using Crestron.SimplSharp;

namespace UserModule_VILLAGLOBAL
{
    public class UserModuleClass_VILLAGLOBAL : SplusObject
    {
        static CCriticalSection g_criticalSection = new CCriticalSection();
        
        
        
        Crestron.Logos.SplusObjects.DigitalInput BTN_ARMER;
        Crestron.Logos.SplusObjects.DigitalInput BTN_DESARMER;
        Crestron.Logos.SplusObjects.DigitalInput BTN_CODE_EFFACE;
        Crestron.Logos.SplusObjects.DigitalInput RETOUR_CODE_ACCEPTE;
        Crestron.Logos.SplusObjects.DigitalInput RETOUR_CODE_REFUSE;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_PARTITION;
        InOutArray<Crestron.Logos.SplusObjects.DigitalInput> BTN_CENTRAL;
        Crestron.Logos.SplusObjects.StringInput IN_CODE__DOLLAR__;
        Crestron.Logos.SplusObjects.DigitalOutput FB_ARMER;
        Crestron.Logos.SplusObjects.DigitalOutput FB_DESARMER;
        Crestron.Logos.SplusObjects.DigitalOutput FB_CODE_VALIDE;
        Crestron.Logos.SplusObjects.DigitalOutput FB_CODE_REFUSE;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_ARMER;
        Crestron.Logos.SplusObjects.DigitalOutput PILOTE_DESARMER;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_PARTITION;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> FB_CENTRAL;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> G;
        InOutArray<Crestron.Logos.SplusObjects.DigitalOutput> PILOTE_PARTITION;
        Crestron.Logos.SplusObjects.StringOutput PILOTE_CODE__DOLLAR__;
        CrestronString SAISIE;
        ushort ARME = 0;
        ushort ATTENTE = 0;
        ushort VACANCES = 0;
        private void MAJALARME (  SplusExecutionContext __context__ ) 
            { 
            ushort P = 0;
            
            
            __context__.SourceCodeLine = 24;
            FB_ARMER  .Value = (ushort) ( ARME ) ; 
            __context__.SourceCodeLine = 24;
            FB_DESARMER  .Value = (ushort) ( Functions.Not( ARME ) ) ; 
            __context__.SourceCodeLine = 25;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( 1 ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)4; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( P  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (P  >= __FN_FORSTART_VAL__1) && (P  <= __FN_FOREND_VAL__1) ) : ( (P  <= __FN_FORSTART_VAL__1) && (P  >= __FN_FOREND_VAL__1) ) ; P  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 25;
                FB_PARTITION [ (((P - 1) * 3) + 1)]  .Value = (ushort) ( Functions.BoolToInt (_SplusNVRAM.ETATPARTITION[ P ] == 1) ) ; 
                __context__.SourceCodeLine = 25;
                FB_PARTITION [ (((P - 1) * 3) + 2)]  .Value = (ushort) ( Functions.BoolToInt (_SplusNVRAM.ETATPARTITION[ P ] == 2) ) ; 
                __context__.SourceCodeLine = 25;
                FB_PARTITION [ (((P - 1) * 3) + 3)]  .Value = (ushort) ( Functions.BoolToInt (_SplusNVRAM.ETATPARTITION[ P ] == 0) ) ; 
                __context__.SourceCodeLine = 25;
                } 
            
            
            }
            
        object IN_CODE__DOLLAR___OnChange_0 ( Object __EventInfo__ )
        
            { 
            Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
            try
            {
                SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
                
                __context__.SourceCodeLine = 29;
                SAISIE  .UpdateValue ( IN_CODE__DOLLAR__  ) ; 
                __context__.SourceCodeLine = 30;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (Functions.Length( SAISIE ) == 0))  ) ) 
                    {
                    __context__.SourceCodeLine = 30;
                    return  this ; 
                    }
                
                __context__.SourceCodeLine = 31;
                PILOTE_CODE__DOLLAR__  .UpdateValue ( SAISIE  ) ; 
                __context__.SourceCodeLine = 32;
                ATTENTE = (ushort) ( 1 ) ; 
                __context__.SourceCodeLine = 33;
                CreateWait ( "REPLI" , 120 , REPLI_Callback ) ;
                
                
            }
            catch(Exception e) { ObjectCatchHandler(e); }
            finally { ObjectFinallyHandler( __SignalEventArg__ ); }
            return this;
            
        }
        
    public void REPLI_CallbackFn( object stateInfo )
    {
    
        try
        {
            Wait __LocalWait__ = (Wait)stateInfo;
            SplusExecutionContext __context__ = SplusThreadStartCode(__LocalWait__);
            __LocalWait__.RemoveFromList();
            
            
            __context__.SourceCodeLine = 33;
            if ( Functions.TestForTrue  ( ( ATTENTE)  ) ) 
                { 
                __context__.SourceCodeLine = 33;
                ATTENTE = (ushort) ( 0 ) ; 
                __context__.SourceCodeLine = 33;
                if ( Functions.TestForTrue  ( ( Functions.BoolToInt (SAISIE == "1234"))  ) ) 
                    { 
                    __context__.SourceCodeLine = 33;
                    Functions.Pulse ( 50, FB_CODE_VALIDE ) ; 
                    } 
                
                else 
                    { 
                    __context__.SourceCodeLine = 33;
                    Functions.Pulse ( 50, FB_CODE_REFUSE ) ; 
                    } 
                
                } 
            
            
        
        
        }
        catch(Exception e) { ObjectCatchHandler(e); }
        finally { ObjectFinallyHandler(); }
        
    }
    
object RETOUR_CODE_ACCEPTE_OnPush_1 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 35;
        if ( Functions.TestForTrue  ( ( ATTENTE)  ) ) 
            { 
            __context__.SourceCodeLine = 35;
            ATTENTE = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 35;
            CancelWait ( "REPLI" ) ; 
            __context__.SourceCodeLine = 35;
            Functions.Pulse ( 50, FB_CODE_VALIDE ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object RETOUR_CODE_REFUSE_OnPush_2 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 36;
        if ( Functions.TestForTrue  ( ( ATTENTE)  ) ) 
            { 
            __context__.SourceCodeLine = 36;
            ATTENTE = (ushort) ( 0 ) ; 
            __context__.SourceCodeLine = 36;
            CancelWait ( "REPLI" ) ; 
            __context__.SourceCodeLine = 36;
            Functions.Pulse ( 50, FB_CODE_REFUSE ) ; 
            } 
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CODE_EFFACE_OnPush_3 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 37;
        SAISIE  .UpdateValue ( ""  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_ARMER_OnPush_4 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 38;
        ARME = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 38;
        MAJALARME (  __context__  ) ; 
        __context__.SourceCodeLine = 38;
        Functions.Pulse ( 50, PILOTE_ARMER ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_DESARMER_OnPush_5 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        
        __context__.SourceCodeLine = 39;
        ARME = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 39;
        MAJALARME (  __context__  ) ; 
        __context__.SourceCodeLine = 39;
        Functions.Pulse ( 50, PILOTE_DESARMER ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_PARTITION_OnPush_6 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort K = 0;
        ushort P = 0;
        ushort A = 0;
        
        
        __context__.SourceCodeLine = 43;
        K = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 43;
        P = (ushort) ( (((K - 1) / 3) + 1) ) ; 
        __context__.SourceCodeLine = 43;
        A = (ushort) ( Mod( (K - 1) , 3 ) ) ; 
        __context__.SourceCodeLine = 44;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt (A == 0))  ) ) 
            { 
            __context__.SourceCodeLine = 44;
            _SplusNVRAM.ETATPARTITION [ P] = (ushort) ( 1 ) ; 
            } 
        
        else 
            {
            __context__.SourceCodeLine = 44;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (A == 1))  ) ) 
                { 
                __context__.SourceCodeLine = 44;
                _SplusNVRAM.ETATPARTITION [ P] = (ushort) ( 2 ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 44;
                _SplusNVRAM.ETATPARTITION [ P] = (ushort) ( 0 ) ; 
                } 
            
            }
        
        __context__.SourceCodeLine = 45;
        MAJALARME (  __context__  ) ; 
        __context__.SourceCodeLine = 45;
        Functions.Pulse ( 50, PILOTE_PARTITION [ K] ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

object BTN_CENTRAL_OnPush_7 ( Object __EventInfo__ )

    { 
    Crestron.Logos.SplusObjects.SignalEventArgs __SignalEventArg__ = (Crestron.Logos.SplusObjects.SignalEventArgs)__EventInfo__;
    try
    {
        SplusExecutionContext __context__ = SplusThreadStartCode(__SignalEventArg__);
        ushort K = 0;
        ushort I = 0;
        ushort DEB = 0;
        ushort FIN = 0;
        
        
        __context__.SourceCodeLine = 50;
        K = (ushort) ( Functions.GetLastModifiedArrayIndex( __SignalEventArg__ ) ) ; 
        __context__.SourceCodeLine = 51;
        if ( Functions.TestForTrue  ( ( Functions.BoolToInt ( K <= 9 ))  ) ) 
            { 
            __context__.SourceCodeLine = 53;
            DEB = (ushort) ( ((((K - 1) / 3) * 3) + 1) ) ; 
            __context__.SourceCodeLine = 53;
            FIN = (ushort) ( (DEB + 2) ) ; 
            __context__.SourceCodeLine = 54;
            ushort __FN_FORSTART_VAL__1 = (ushort) ( DEB ) ;
            ushort __FN_FOREND_VAL__1 = (ushort)FIN; 
            int __FN_FORSTEP_VAL__1 = (int)1; 
            for ( I  = __FN_FORSTART_VAL__1; (__FN_FORSTEP_VAL__1 > 0)  ? ( (I  >= __FN_FORSTART_VAL__1) && (I  <= __FN_FOREND_VAL__1) ) : ( (I  <= __FN_FORSTART_VAL__1) && (I  >= __FN_FOREND_VAL__1) ) ; I  += (ushort)__FN_FORSTEP_VAL__1) 
                { 
                __context__.SourceCodeLine = 54;
                FB_CENTRAL [ I]  .Value = (ushort) ( Functions.BoolToInt (I == K) ) ; 
                __context__.SourceCodeLine = 54;
                } 
            
            __context__.SourceCodeLine = 55;
            Functions.Pulse ( 50, G [ K] ) ; 
            } 
        
        else 
            {
            __context__.SourceCodeLine = 57;
            if ( Functions.TestForTrue  ( ( Functions.BoolToInt (K == 10))  ) ) 
                { 
                __context__.SourceCodeLine = 57;
                VACANCES = (ushort) ( 1 ) ; 
                __context__.SourceCodeLine = 57;
                FB_CENTRAL [ 10]  .Value = (ushort) ( 1 ) ; 
                __context__.SourceCodeLine = 57;
                FB_CENTRAL [ 11]  .Value = (ushort) ( 0 ) ; 
                __context__.SourceCodeLine = 57;
                Functions.Pulse ( 50, G [ 10] ) ; 
                } 
            
            else 
                { 
                __context__.SourceCodeLine = 58;
                VACANCES = (ushort) ( 0 ) ; 
                __context__.SourceCodeLine = 58;
                FB_CENTRAL [ 10]  .Value = (ushort) ( 0 ) ; 
                __context__.SourceCodeLine = 58;
                FB_CENTRAL [ 11]  .Value = (ushort) ( 1 ) ; 
                } 
            
            }
        
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler( __SignalEventArg__ ); }
    return this;
    
}

public override object FunctionMain (  object __obj__ ) 
    { 
    try
    {
        SplusExecutionContext __context__ = SplusFunctionMainStartCode();
        
        __context__.SourceCodeLine = 62;
        WaitForInitializationComplete ( ) ; 
        __context__.SourceCodeLine = 63;
        ARME = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 63;
        VACANCES = (ushort) ( 0 ) ; 
        __context__.SourceCodeLine = 63;
        FB_CENTRAL [ 11]  .Value = (ushort) ( 1 ) ; 
        __context__.SourceCodeLine = 63;
        MAJALARME (  __context__  ) ; 
        
        
    }
    catch(Exception e) { ObjectCatchHandler(e); }
    finally { ObjectFinallyHandler(); }
    return __obj__;
    }
    

public override void LogosSplusInitialize()
{
    SocketInfo __socketinfo__ = new SocketInfo( 1, this );
    InitialParametersClass.ResolveHostName = __socketinfo__.ResolveHostName;
    _SplusNVRAM = new SplusNVRAM( this );
    _SplusNVRAM.ETATPARTITION  = new ushort[ 5 ];
    SAISIE  = new CrestronString( Crestron.Logos.SplusObjects.CrestronStringEncoding.eEncodingASCII, 20, this );
    
    BTN_ARMER = new Crestron.Logos.SplusObjects.DigitalInput( BTN_ARMER__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_ARMER__DigitalInput__, BTN_ARMER );
    
    BTN_DESARMER = new Crestron.Logos.SplusObjects.DigitalInput( BTN_DESARMER__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_DESARMER__DigitalInput__, BTN_DESARMER );
    
    BTN_CODE_EFFACE = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CODE_EFFACE__DigitalInput__, this );
    m_DigitalInputList.Add( BTN_CODE_EFFACE__DigitalInput__, BTN_CODE_EFFACE );
    
    RETOUR_CODE_ACCEPTE = new Crestron.Logos.SplusObjects.DigitalInput( RETOUR_CODE_ACCEPTE__DigitalInput__, this );
    m_DigitalInputList.Add( RETOUR_CODE_ACCEPTE__DigitalInput__, RETOUR_CODE_ACCEPTE );
    
    RETOUR_CODE_REFUSE = new Crestron.Logos.SplusObjects.DigitalInput( RETOUR_CODE_REFUSE__DigitalInput__, this );
    m_DigitalInputList.Add( RETOUR_CODE_REFUSE__DigitalInput__, RETOUR_CODE_REFUSE );
    
    BTN_PARTITION = new InOutArray<DigitalInput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        BTN_PARTITION[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_PARTITION__DigitalInput__ + i, BTN_PARTITION__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_PARTITION__DigitalInput__ + i, BTN_PARTITION[i+1] );
    }
    
    BTN_CENTRAL = new InOutArray<DigitalInput>( 11, this );
    for( uint i = 0; i < 11; i++ )
    {
        BTN_CENTRAL[i+1] = new Crestron.Logos.SplusObjects.DigitalInput( BTN_CENTRAL__DigitalInput__ + i, BTN_CENTRAL__DigitalInput__, this );
        m_DigitalInputList.Add( BTN_CENTRAL__DigitalInput__ + i, BTN_CENTRAL[i+1] );
    }
    
    FB_ARMER = new Crestron.Logos.SplusObjects.DigitalOutput( FB_ARMER__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_ARMER__DigitalOutput__, FB_ARMER );
    
    FB_DESARMER = new Crestron.Logos.SplusObjects.DigitalOutput( FB_DESARMER__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_DESARMER__DigitalOutput__, FB_DESARMER );
    
    FB_CODE_VALIDE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_CODE_VALIDE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_CODE_VALIDE__DigitalOutput__, FB_CODE_VALIDE );
    
    FB_CODE_REFUSE = new Crestron.Logos.SplusObjects.DigitalOutput( FB_CODE_REFUSE__DigitalOutput__, this );
    m_DigitalOutputList.Add( FB_CODE_REFUSE__DigitalOutput__, FB_CODE_REFUSE );
    
    PILOTE_ARMER = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_ARMER__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_ARMER__DigitalOutput__, PILOTE_ARMER );
    
    PILOTE_DESARMER = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_DESARMER__DigitalOutput__, this );
    m_DigitalOutputList.Add( PILOTE_DESARMER__DigitalOutput__, PILOTE_DESARMER );
    
    FB_PARTITION = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        FB_PARTITION[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_PARTITION__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_PARTITION__DigitalOutput__ + i, FB_PARTITION[i+1] );
    }
    
    FB_CENTRAL = new InOutArray<DigitalOutput>( 11, this );
    for( uint i = 0; i < 11; i++ )
    {
        FB_CENTRAL[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( FB_CENTRAL__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( FB_CENTRAL__DigitalOutput__ + i, FB_CENTRAL[i+1] );
    }
    
    G = new InOutArray<DigitalOutput>( 10, this );
    for( uint i = 0; i < 10; i++ )
    {
        G[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( G__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( G__DigitalOutput__ + i, G[i+1] );
    }
    
    PILOTE_PARTITION = new InOutArray<DigitalOutput>( 12, this );
    for( uint i = 0; i < 12; i++ )
    {
        PILOTE_PARTITION[i+1] = new Crestron.Logos.SplusObjects.DigitalOutput( PILOTE_PARTITION__DigitalOutput__ + i, this );
        m_DigitalOutputList.Add( PILOTE_PARTITION__DigitalOutput__ + i, PILOTE_PARTITION[i+1] );
    }
    
    IN_CODE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringInput( IN_CODE__DOLLAR____AnalogSerialInput__, 20, this );
    m_StringInputList.Add( IN_CODE__DOLLAR____AnalogSerialInput__, IN_CODE__DOLLAR__ );
    
    PILOTE_CODE__DOLLAR__ = new Crestron.Logos.SplusObjects.StringOutput( PILOTE_CODE__DOLLAR____AnalogSerialOutput__, this );
    m_StringOutputList.Add( PILOTE_CODE__DOLLAR____AnalogSerialOutput__, PILOTE_CODE__DOLLAR__ );
    
    REPLI_Callback = new WaitFunction( REPLI_CallbackFn );
    
    IN_CODE__DOLLAR__.OnSerialChange.Add( new InputChangeHandlerWrapper( IN_CODE__DOLLAR___OnChange_0, false ) );
    RETOUR_CODE_ACCEPTE.OnDigitalPush.Add( new InputChangeHandlerWrapper( RETOUR_CODE_ACCEPTE_OnPush_1, false ) );
    RETOUR_CODE_REFUSE.OnDigitalPush.Add( new InputChangeHandlerWrapper( RETOUR_CODE_REFUSE_OnPush_2, false ) );
    BTN_CODE_EFFACE.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CODE_EFFACE_OnPush_3, false ) );
    BTN_ARMER.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_ARMER_OnPush_4, false ) );
    BTN_DESARMER.OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_DESARMER_OnPush_5, false ) );
    for( uint i = 0; i < 12; i++ )
        BTN_PARTITION[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_PARTITION_OnPush_6, false ) );
        
    for( uint i = 0; i < 11; i++ )
        BTN_CENTRAL[i+1].OnDigitalPush.Add( new InputChangeHandlerWrapper( BTN_CENTRAL_OnPush_7, false ) );
        
    
    _SplusNVRAM.PopulateCustomAttributeList( true );
    
    NVRAM = _SplusNVRAM;
    
}

public override void LogosSimplSharpInitialize()
{
    
    
}

public UserModuleClass_VILLAGLOBAL ( string InstanceName, string ReferenceID, Crestron.Logos.SplusObjects.CrestronStringEncoding nEncodingType ) : base( InstanceName, ReferenceID, nEncodingType ) {}


private WaitFunction REPLI_Callback;


const uint BTN_ARMER__DigitalInput__ = 0;
const uint BTN_DESARMER__DigitalInput__ = 1;
const uint BTN_CODE_EFFACE__DigitalInput__ = 2;
const uint RETOUR_CODE_ACCEPTE__DigitalInput__ = 3;
const uint RETOUR_CODE_REFUSE__DigitalInput__ = 4;
const uint BTN_PARTITION__DigitalInput__ = 5;
const uint BTN_CENTRAL__DigitalInput__ = 17;
const uint IN_CODE__DOLLAR____AnalogSerialInput__ = 0;
const uint FB_ARMER__DigitalOutput__ = 0;
const uint FB_DESARMER__DigitalOutput__ = 1;
const uint FB_CODE_VALIDE__DigitalOutput__ = 2;
const uint FB_CODE_REFUSE__DigitalOutput__ = 3;
const uint PILOTE_ARMER__DigitalOutput__ = 4;
const uint PILOTE_DESARMER__DigitalOutput__ = 5;
const uint FB_PARTITION__DigitalOutput__ = 6;
const uint FB_CENTRAL__DigitalOutput__ = 18;
const uint G__DigitalOutput__ = 29;
const uint PILOTE_PARTITION__DigitalOutput__ = 39;
const uint PILOTE_CODE__DOLLAR____AnalogSerialOutput__ = 0;

[SplusStructAttribute(-1, true, false)]
public class SplusNVRAM : SplusStructureBase
{

    public SplusNVRAM( SplusObject __caller__ ) : base( __caller__ ) {}
    
    [SplusStructAttribute(0, false, true)]
            public ushort [] ETATPARTITION;
            
}

SplusNVRAM _SplusNVRAM = null;

public class __CEvent__ : CEvent
{
    public __CEvent__() {}
    public void Close() { base.Close(); }
    public int Reset() { return base.Reset() ? 1 : 0; }
    public int Set() { return base.Set() ? 1 : 0; }
    public int Wait( int timeOutInMs ) { return base.Wait( timeOutInMs ) ? 1 : 0; }
}
public class __CMutex__ : CMutex
{
    public __CMutex__() {}
    public void Close() { base.Close(); }
    public void ReleaseMutex() { base.ReleaseMutex(); }
    public int WaitForMutex() { return base.WaitForMutex() ? 1 : 0; }
}
 public int IsNull( object obj ){ return (obj == null) ? 1 : 0; }
}


}
