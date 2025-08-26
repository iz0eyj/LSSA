import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit, Eye, Upload, Download } from 'lucide-react';
import { apiClient } from '../lib/api';
import { BucketVisibility, BucketVisibilityOptions } from '../types/bucketTypes';
// Utilizziamo console.log per i messaggi invece di toast fino a quando non installiamo sonner

import { Bucket, S3Object as BucketObject } from '../../../shared/types';



const BucketsView: React.FC = () => {
  // Stati principali
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Stati per modali
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);

  // Stati per form
  const [newBucketName, setNewBucketName] = useState('');
  const [editBucketName, setEditBucketName] = useState('');
  
  // Stati per opzioni di visibilità
  const [bucketVisibility, setBucketVisibility] = useState<BucketVisibility>(BucketVisibility.PRIVATE);
  const [websiteAccess, setWebsiteAccess] = useState(false);
  const [corsEnabled, setCorsEnabled] = useState(false);

  // Stati per modifica bucket avanzata
  const [editBucketVisibility, setEditBucketVisibility] = useState<BucketVisibility>(BucketVisibility.PRIVATE);
  const [editWebsiteAccess, setEditWebsiteAccess] = useState(false);
  const [editCorsEnabled, setEditCorsEnabled] = useState(false);
  const [editIndexDocument, setEditIndexDocument] = useState('index.html');
  const [editErrorDocument, setEditErrorDocument] = useState('error.html');
  const [editGlobalAliases, setEditGlobalAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [corsOrigins, setCorsOrigins] = useState<string[]>(['*']);
  const [corsMethods, setCorsMethods] = useState<string[]>(['GET', 'POST', 'PUT', 'DELETE']);
  const [corsHeaders, setCorsHeaders] = useState<string[]>(['*']);

  // Stati per oggetti bucket
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);
  const [loadingObjects, setLoadingObjects] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch buckets
  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.listBuckets();
      if (result.success && result.data) {
        setBuckets(Array.isArray(result.data) ? result.data : []);
      } else {
        // Se l'errore indica che non ci sono bucket, non è un errore ma uno stato vuoto
        if (result.error && (result.error.includes('404') || result.error.includes('not found') || result.error.includes('empty'))) {
          setBuckets([]);
          setError(null);
        } else {
          throw new Error(result.error || 'Errore nel caricamento dei bucket');
        }
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      
      // Distingui tra errori di connessione e altri errori
      if (err?.response?.status === 503 || errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
        setError('Servizio temporaneamente non disponibile. Il server potrebbe essere in avvio.');
      } else if (err?.response?.status === 500 || errorMessage.includes('500')) {
        setError('Errore interno del server. Verifica la configurazione di Garage.');
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        setError('Errore di connessione. Verifica che il server Garage sia in esecuzione.');
      } else {
        setError(errorMessage);
      }
      
      console.error(`Errore nel caricamento dei bucket: ${errorMessage}`);
      setBuckets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch oggetti di un bucket
  const fetchBucketObjects = async (bucketId: string) => {
    try {
      setLoadingObjects(true);
      
      const result = await apiClient.listBucketObjects(bucketId);
      console.log('📦 Frontend - Received bucket objects response:', {
        success: result.success,
        data: result.data,
        objectCount: result.data?.contents?.length || 0
      });
      
      if (result.success && result.data) {
        const objects = result.data.contents || [];
        console.log('📦 Frontend - Setting bucket objects:', objects);
        setBucketObjects(objects);
      } else {
        throw new Error(result.error || 'Errore nel caricamento degli oggetti');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error(`Errore nel caricamento degli oggetti: ${errorMessage}`);
      setBucketObjects([]);
    } finally {
      setLoadingObjects(false);
    }
  };

  // Crea bucket
  const createBucket = async () => {
    if (!newBucketName.trim()) {
      console.error('Il nome del bucket è obbligatorio');
      return;
    }

    try {
      const visibilityOptions: BucketVisibilityOptions = {
        visibility: bucketVisibility,
        website_access: websiteAccess,
        cors_enabled: corsEnabled
      };

      const result = await apiClient.createBucket({ 
        global_alias: newBucketName.trim(),
        visibility_options: visibilityOptions
      });
      
      if (result.success) {
        console.log('Bucket creato con successo con opzioni:', visibilityOptions);
        setNewBucketName('');
        setBucketVisibility(BucketVisibility.PRIVATE);
        setWebsiteAccess(false);
        setCorsEnabled(false);
        setShowCreateModal(false);
        await fetchBuckets();
      } else {
        throw new Error(result.error || 'Errore nella creazione del bucket');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error(`Errore nella creazione del bucket: ${errorMessage}`);
    }
  };

  // Elimina bucket
  const deleteBucket = async () => {
    console.log('🗑️ DELETE BUCKET DEBUG - Funzione deleteBucket chiamata');
    
    if (!selectedBucket) {
      console.log('❌ DELETE BUCKET DEBUG - Nessun bucket selezionato');
      alert('Errore: nessun bucket selezionato');
      return;
    }

    console.log('🔍 DELETE BUCKET DEBUG - Bucket selezionato:', {
      id: selectedBucket.id,
      globalAliases: selectedBucket.global_aliases,
      localAliases: selectedBucket.local_aliases
    });

    try {
      console.log('🚀 DELETE BUCKET DEBUG - Chiamata API deleteBucket con ID:', selectedBucket.id);
      
      const result = await apiClient.deleteBucket(selectedBucket.id);
      
      console.log('📨 DELETE BUCKET DEBUG - Risposta API ricevuta:', {
        success: result.success,
        error: result.error,
        message: result.message
      });
      
      if (result.success) {
        console.log('✅ DELETE BUCKET DEBUG - Bucket eliminato con successo, chiudo modale e aggiorno lista');
        setShowDeleteModal(false);
        setSelectedBucket(null);
        
        console.log('🔄 DELETE BUCKET DEBUG - Ricarico lista bucket...');
        await fetchBuckets();
        console.log('✅ DELETE BUCKET DEBUG - Lista bucket ricaricata');
        
        alert('Bucket eliminato con successo!');
      } else {
        console.log('❌ DELETE BUCKET DEBUG - Eliminazione fallita:', result.error);
        throw new Error(result.error || 'Errore nell\'eliminazione del bucket');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('❌ DELETE BUCKET DEBUG - Errore catturato:', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : 'N/A',
        bucketId: selectedBucket.id
      });
      
      alert(`Errore nell'eliminazione del bucket: ${errorMessage}`);
    }
  };

  // Modifica bucket
  const updateBucket = async () => {
    if (!selectedBucket) {
      console.error('Nessun bucket selezionato');
      return;
    }

    try {
      console.log('🔧 Inizio aggiornamento bucket:', {
        bucketId: selectedBucket.id,
        visibility: editBucketVisibility,
        websiteAccess: editWebsiteAccess,
        corsEnabled: editCorsEnabled,
        aliases: editGlobalAliases,
        indexDocument: editIndexDocument,
        errorDocument: editErrorDocument
      });

      // 0. Aggiorna visibilità del bucket se necessario
      const currentIsPublic = selectedBucket.website_access || (selectedBucket.cors_rules && selectedBucket.cors_rules.length > 0);
      const currentVisibility = currentIsPublic ? BucketVisibility.PUBLIC : BucketVisibility.PRIVATE;
      
      if (editBucketVisibility !== currentVisibility) {
        console.log('👁️ Aggiornamento visibilità bucket:', {
          from: currentVisibility,
          to: editBucketVisibility
        });
        
        // La visibilità viene gestita tramite le configurazioni web e CORS
        // Se il bucket diventa pubblico, abilita almeno l'accesso web
        if (editBucketVisibility === BucketVisibility.PUBLIC && !editWebsiteAccess && !editCorsEnabled) {
          setEditWebsiteAccess(true);
          console.log('🌐 Abilitazione automatica accesso web per bucket pubblico');
        }
        // Se il bucket diventa privato, disabilita web e CORS
        else if (editBucketVisibility === BucketVisibility.PRIVATE) {
          setEditWebsiteAccess(false);
          setEditCorsEnabled(false);
          console.log('🔒 Disabilitazione automatica accesso web e CORS per bucket privato');
        }
      }

      // 1. Aggiorna configurazione sito web se necessario
      if (editWebsiteAccess !== selectedBucket.website_access) {
        console.log('🌐 Aggiornamento configurazione sito web...');
        const websiteResult = await apiClient.updateBucketWebsite(selectedBucket.id, {
          enabled: editWebsiteAccess,
          indexDocument: editWebsiteAccess ? editIndexDocument : undefined,
          errorDocument: editWebsiteAccess ? editErrorDocument : undefined
        });
        
        if (!websiteResult.success) {
          throw new Error(websiteResult.error || 'Errore nell\'aggiornamento della configurazione web');
        }
        console.log('✅ Configurazione sito web aggiornata');
      }

      // 2. Aggiorna configurazione CORS se necessario
      const currentCorsEnabled = selectedBucket.cors_rules && selectedBucket.cors_rules.length > 0;
      if (editCorsEnabled !== currentCorsEnabled) {
        console.log('🔗 Aggiornamento configurazione CORS...');
        const corsResult = await apiClient.updateBucketCors(selectedBucket.id, {
          enabled: editCorsEnabled,
          origins: editCorsEnabled ? corsOrigins : [],
          methods: editCorsEnabled ? corsMethods : [],
          headers: editCorsEnabled ? corsHeaders : []
        });
        
        if (!corsResult.success) {
          throw new Error(corsResult.error || 'Errore nell\'aggiornamento della configurazione CORS');
        }
        console.log('✅ Configurazione CORS aggiornata');
      }

      // 3. Gestisci alias globali
      const currentAliases = selectedBucket.global_aliases || [];
      const aliasesToAdd = editGlobalAliases.filter(alias => !currentAliases.includes(alias));
      const aliasesToRemove = currentAliases.filter(alias => !editGlobalAliases.includes(alias));

      // Aggiungi nuovi alias
      for (const alias of aliasesToAdd) {
        console.log(`➕ Aggiunta alias: ${alias}`);
        const addAliasResult = await apiClient.addBucketAlias(selectedBucket.id, alias);
        if (!addAliasResult.success) {
          console.warn(`⚠️ Errore nell'aggiunta dell'alias ${alias}:`, addAliasResult.error);
          // Non blocchiamo l'operazione per errori di alias singoli
        }
      }

      // Rimuovi alias non più presenti
      for (const alias of aliasesToRemove) {
        console.log(`➖ Rimozione alias: ${alias}`);
        const removeAliasResult = await apiClient.removeBucketAlias(selectedBucket.id, alias);
        if (!removeAliasResult.success) {
          console.warn(`⚠️ Errore nella rimozione dell'alias ${alias}:`, removeAliasResult.error);
          // Non blocchiamo l'operazione per errori di alias singoli
        }
      }

      console.log('✅ Bucket aggiornato con successo');
      
      // Chiudi modale e resetta stati
      setShowEditModal(false);
      setSelectedBucket(null);
      setEditBucketName('');
      setEditBucketVisibility(BucketVisibility.PRIVATE);
      setEditWebsiteAccess(false);
      setEditCorsEnabled(false);
      setEditIndexDocument('index.html');
      setEditErrorDocument('error.html');
      setEditGlobalAliases([]);
      setNewAlias('');
      setCorsOrigins(['*']);
      setCorsMethods(['GET', 'POST', 'PUT', 'DELETE']);
      setCorsHeaders(['*']);
      
      // Ricarica la lista dei bucket
      await fetchBuckets();
      
      alert('Bucket aggiornato con successo!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('❌ Errore nell\'aggiornamento del bucket:', {
        error: errorMessage,
        bucketId: selectedBucket.id,
        stack: err instanceof Error ? err.stack : undefined
      });
      alert(`Errore nell'aggiornamento del bucket: ${errorMessage}`);
    }
  };

  // Upload file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBucket) {
      console.log('🚫 Upload abortito:', { file: !!file, selectedBucket: !!selectedBucket });
      return;
    }

    try {
      setUploadingFile(true);
      console.log('📤 DEBUG - Inizio caricamento file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucketId: selectedBucket.id,
        bucketName: getBucketDisplayName(selectedBucket),
        bucketAliases: selectedBucket.global_aliases,
        bucketWebAccess: selectedBucket.website_access
      });
      
      const result = await apiClient.uploadObject(
        selectedBucket.id,
        file.name,
        file
      );
      
      console.log('📤 DEBUG - Risposta API upload:', {
        success: result.success,
        error: result.error,
        data: result.data
      });
      
      if (result.success) {
        console.log('✅ File caricato con successo');
        await fetchBucketObjects(selectedBucket.id);
      } else {
        throw new Error(result.error || 'Errore nel caricamento del file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('❌ Errore nel caricamento del file:', {
        error: errorMessage,
        bucketId: selectedBucket?.id,
        fileName: file?.name,
        stack: err instanceof Error ? err.stack : undefined
      });
      alert(`Errore nel caricamento del file: ${errorMessage}`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download file
  const handleFileDownload = async (objectKey: string) => {
    if (!selectedBucket) {
      return;
    }

    try {
      setDownloadingFile(objectKey);
      console.log(`Scaricamento file: ${objectKey}`);
      
      // apiClient.downloadObject restituisce direttamente un Blob
      const blob = await apiClient.downloadObject(selectedBucket.id, objectKey);
      
      // Verifica che il blob sia valido
      if (!blob || blob.size === 0) {
        throw new Error('File vuoto o non trovato');
      }
      
      // Crea URL temporaneo per il download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = objectKey;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('File scaricato con successo');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error(`Errore nel download del file: ${errorMessage}`);
      // Mostra un messaggio di errore all'utente
      alert(`Errore nel download del file: ${errorMessage}`);
    } finally {
      setDownloadingFile(null);
    }
  };

  // Gestione eliminazione oggetti
  const handleDeleteObject = async (objectKey: string) => {
    if (!selectedBucket) {
      alert('Errore: nessun bucket selezionato');
      return;
    }

    const confirmed = confirm(`Sei sicuro di voler eliminare il file "${objectKey}"?`);
    if (!confirmed) {
      return;
    }

    try {
      console.log(`Eliminazione oggetto: ${objectKey}`);
      
      const result = await apiClient.deleteObject(selectedBucket.id, objectKey);
      
      if (result.success) {
        console.log('Oggetto eliminato con successo');
        await fetchBucketObjects(selectedBucket.id);
      } else {
        throw new Error(result.error || 'Errore nell\'eliminazione dell\'oggetto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error(`Errore nell'eliminazione dell'oggetto: ${errorMessage}`);
      alert(`Errore nell'eliminazione dell'oggetto: ${errorMessage}`);
    }
  };



  // Apri modale ispezione
  const openInspectModal = async (bucket: Bucket) => {
    console.log('🔍 INSPECT MODAL DEBUG - Apertura modale ispezione per bucket:', {
      bucketId: bucket.id,
      globalAliases: bucket.global_aliases,
      localAliases: bucket.local_aliases,
      websiteAccess: bucket.website_access,
      bucketObject: bucket
    });
    
    setSelectedBucket(bucket);
    setShowInspectModal(true);
    await fetchBucketObjects(bucket.id);
  };

  // Apri modale modifica
  const openEditModal = (bucket: Bucket) => {
    setSelectedBucket(bucket);
    setEditBucketName(bucket.global_aliases?.[0] || bucket.id);
    
    // Determina la visibilità del bucket basandosi sui suoi attributi
    const isPublic = bucket.website_access || (bucket.cors_rules && bucket.cors_rules.length > 0);
    setEditBucketVisibility(isPublic ? BucketVisibility.PUBLIC : BucketVisibility.PRIVATE);
    
    setEditWebsiteAccess(bucket.website_access || false);
    setEditCorsEnabled(Boolean(bucket.cors_rules && bucket.cors_rules.length > 0));
    setEditIndexDocument('index.html'); // Default value
    setEditErrorDocument('error.html'); // Default value
    setEditGlobalAliases(bucket.global_aliases || []);
    setNewAlias('');
    setCorsOrigins(['*']);
    setCorsMethods(['GET', 'POST', 'PUT', 'DELETE']);
    setCorsHeaders(['*']);
    setShowEditModal(true);
  };

  // Apri modale eliminazione
  const openDeleteModal = (bucket: Bucket) => {
    setSelectedBucket(bucket);
    setShowDeleteModal(true);
  };

  // Filtra buckets - protezione per assicurarsi che buckets sia un array
  const filteredBuckets = Array.isArray(buckets) ? buckets.filter(bucket => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bucket.id.toLowerCase().includes(searchLower) ||
      bucket.global_aliases?.some(alias => alias.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Ottieni nome display del bucket
  const getBucketDisplayName = (bucket: Bucket): string => {
    return bucket.global_aliases && bucket.global_aliases.length > 0 ? bucket.global_aliases[0] : bucket.id;
  };

  // Formatta la data o restituisce un messaggio se non valida
  const formatDate = (dateString?: string): string => {
    console.log('📅 Frontend - formatDate called with:', {
      dateString,
      type: typeof dateString,
      length: dateString?.length
    });
    
    if (!dateString) {
      console.log('📅 Frontend - No date string provided');
      return "Data non disponibile";
    }
    
    try {
      const date = new Date(dateString);
      console.log('📅 Frontend - Date parsing:', {
        originalString: dateString,
        parsedDate: date,
        isValid: !isNaN(date.getTime()),
        timestamp: date.getTime()
      });
      
      // Verifica se la data è valida
      if (isNaN(date.getTime())) {
        console.log('📅 Frontend - Invalid date detected');
        return "Data non disponibile";
      }
      
      const formattedDate = date.toLocaleString();
      console.log('📅 Frontend - Formatted date:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error("📅 Frontend - Error formatting date:", error);
      return "Data non disponibile";
    }
  };

  // Effect per caricare i buckets
  useEffect(() => {
    fetchBuckets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Caricamento buckets...</div>
      </div>
    );
  }

  // Solo errori di connessione reali mostrano il messaggio di errore
  if (error && (error.includes('503') || error.includes('500') || error.includes('network') || error.includes('fetch') || error.includes('Failed to fetch'))) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Errore di Connessione</h2>
            <p className="text-gray-600 mb-4 max-w-md">Servizio temporaneamente non disponibile. Il server potrebbe essere in avvio.</p>
            <div className="space-y-2">
              <button
                onClick={fetchBuckets}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              >
                Riprova
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crea Bucket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buckets ({filteredBuckets.length})</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Plus size={20} />
          <span>Nuovo Bucket</span>
        </button>
      </div>

      {/* Barra di ricerca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cerca buckets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Lista buckets */}
      {filteredBuckets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchTerm ? 'Nessun bucket trovato per la ricerca' : 'Nessun bucket disponibile'}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBuckets.map((bucket) => (
            <div key={bucket.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{getBucketDisplayName(bucket)}</h3>
                  <p className="text-gray-600 text-sm">
                    Alias Globali: {bucket.global_aliases && bucket.global_aliases.length > 0 ? bucket.global_aliases.join(', ') : 'Nessun alias'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Accesso web: {bucket.website_access ? 'Abilitato' : 'Disabilitato'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Visibilità: {bucket.website_access || (bucket.cors_rules && bucket.cors_rules.length > 0) ? 'Pubblico' : 'Privato'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openInspectModal(bucket)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Ispeziona"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(bucket)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Modifica"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(bucket)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Creazione */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Crea Nuovo Bucket</h2>
            
            {/* Nome bucket */}
            <input
              type="text"
              placeholder="Nome del bucket"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createBucket()}
            />
            
            {/* Selezione visibilità */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilità del bucket
              </label>
              <select
                value={bucketVisibility}
                onChange={(e) => setBucketVisibility(e.target.value as BucketVisibility)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={BucketVisibility.PRIVATE}>Privato</option>
                <option value={BucketVisibility.PUBLIC}>Pubblico</option>
              </select>
            </div>
            
            {/* Checkbox accesso web */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={websiteAccess}
                  onChange={(e) => setWebsiteAccess(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Abilita accesso web</span>
              </label>
            </div>
            
            {/* Checkbox CORS */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={corsEnabled}
                  onChange={(e) => setCorsEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Abilita CORS</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBucketName('');
                  setBucketVisibility(BucketVisibility.PRIVATE);
                  setWebsiteAccess(false);
                  setCorsEnabled(false);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={createBucket}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Eliminazione */}
      {showDeleteModal && selectedBucket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Elimina Bucket</h2>
            <p className="mb-4">
              Sei sicuro di voler eliminare il bucket <strong>{getBucketDisplayName(selectedBucket)}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBucket(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={deleteBucket}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Modifica Avanzata */}
      {showEditModal && selectedBucket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl max-h-3/4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifica Bucket: {getBucketDisplayName(selectedBucket)}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sezione Informazioni Base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informazioni Base</h3>
                
                {/* Nome principale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome principale del bucket
                  </label>
                  <input
                    type="text"
                    placeholder="Nome del bucket"
                    value={editBucketName}
                    onChange={(e) => setEditBucketName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Visibilità del bucket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilità del bucket
                  </label>
                  <select
                    value={editBucketVisibility}
                    onChange={(e) => setEditBucketVisibility(e.target.value as BucketVisibility)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={BucketVisibility.PRIVATE}>Privato</option>
                    <option value={BucketVisibility.PUBLIC}>Pubblico</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    La visibilità determina se il bucket è accessibile pubblicamente
                  </div>
                </div>

                {/* Accesso Web */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editWebsiteAccess}
                      onChange={(e) => setEditWebsiteAccess(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Abilita accesso web (sito statico)</span>
                  </label>
                </div>

                {/* Configurazione sito web */}
                {editWebsiteAccess && (
                  <div className="ml-6 space-y-3 p-3 bg-blue-50 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documento indice
                      </label>
                      <input
                        type="text"
                        value={editIndexDocument}
                        onChange={(e) => setEditIndexDocument(e.target.value)}
                        placeholder="index.html"
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documento di errore (404)
                      </label>
                      <input
                        type="text"
                        value={editErrorDocument}
                        onChange={(e) => setEditErrorDocument(e.target.value)}
                        placeholder="error.html"
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* CORS */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editCorsEnabled}
                      onChange={(e) => setEditCorsEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Abilita CORS</span>
                  </label>
                </div>

                {/* Configurazione CORS */}
                {editCorsEnabled && (
                  <div className="ml-6 space-y-3 p-3 bg-green-50 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origini consentite (una per riga)
                      </label>
                      <textarea
                        value={corsOrigins.join('\n')}
                        onChange={(e) => setCorsOrigins(e.target.value.split('\n').filter(o => o.trim()))}
                        placeholder="*\nhttps://example.com\nhttps://app.example.com"
                        className="w-full p-2 border border-gray-300 rounded text-sm h-20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metodi HTTP consentiti
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].map(method => (
                          <label key={method} className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={corsMethods.includes(method)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCorsMethods([...corsMethods, method]);
                                } else {
                                  setCorsMethods(corsMethods.filter(m => m !== method));
                                }
                              }}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-xs">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header consentiti (uno per riga)
                      </label>
                      <textarea
                        value={corsHeaders.join('\n')}
                        onChange={(e) => setCorsHeaders(e.target.value.split('\n').filter(h => h.trim()))}
                        placeholder="*\nContent-Type\nAuthorization"
                        className="w-full p-2 border border-gray-300 rounded text-sm h-16"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sezione Alias Globali */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Alias Globali</h3>
                
                {/* Lista alias esistenti */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alias attuali
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {editGlobalAliases.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">Nessun alias configurato</div>
                    ) : (
                      editGlobalAliases.map((alias, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{alias}</span>
                          <button
                            onClick={() => {
                              const newAliases = editGlobalAliases.filter((_, i) => i !== index);
                              setEditGlobalAliases(newAliases);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Rimuovi alias"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Aggiungi nuovo alias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aggiungi nuovo alias
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAlias}
                      onChange={(e) => setNewAlias(e.target.value)}
                      placeholder="nuovo-alias.example.com"
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newAlias.trim() && !editGlobalAliases.includes(newAlias.trim())) {
                          setEditGlobalAliases([...editGlobalAliases, newAlias.trim()]);
                          setNewAlias('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newAlias.trim() && !editGlobalAliases.includes(newAlias.trim())) {
                          setEditGlobalAliases([...editGlobalAliases, newAlias.trim()]);
                          setNewAlias('');
                        }
                      }}
                      disabled={!newAlias.trim() || editGlobalAliases.includes(newAlias.trim())}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Aggiungi
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Premi Invio o clicca "Aggiungi" per aggiungere l'alias
                  </div>
                </div>

                {/* Informazioni aggiuntive */}
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Informazioni</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Gli alias globali permettono di accedere al bucket con nomi personalizzati</li>
                    <li>• Utile per configurare domini personalizzati per siti web</li>
                    <li>• Il primo alias viene utilizzato come nome principale del bucket</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pulsanti azione */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBucket(null);
                  setEditBucketName('');
                  setEditBucketVisibility(BucketVisibility.PRIVATE);
                  setEditWebsiteAccess(false);
                  setEditCorsEnabled(false);
                  setEditIndexDocument('index.html');
                  setEditErrorDocument('error.html');
                  setEditGlobalAliases([]);
                  setNewAlias('');
                  setCorsOrigins(['*']);
                  setCorsMethods(['GET', 'POST', 'PUT', 'DELETE']);
                  setCorsHeaders(['*']);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={updateBucket}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modale Ispezione */}
      {showInspectModal && selectedBucket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl max-h-3/4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Dettagli Bucket: {getBucketDisplayName(selectedBucket)}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Informazioni</h3>
              {(() => {
                console.log('🔍 INSPECT MODAL DEBUG - Rendering bucket info:', {
                  selectedBucket: selectedBucket,
                  id: selectedBucket.id,
                  website_access: selectedBucket.website_access,
                  global_aliases: selectedBucket.global_aliases,
                  global_aliases_type: typeof selectedBucket.global_aliases,
                  global_aliases_length: selectedBucket.global_aliases?.length,
                  local_aliases: selectedBucket.local_aliases,
                  local_aliases_type: typeof selectedBucket.local_aliases,
                  local_aliases_length: selectedBucket.local_aliases?.length
                });
                return null;
              })()}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {selectedBucket.id}
                </div>
                <div>
                  <strong>Accesso Web:</strong> {selectedBucket.website_access ? 'Abilitato' : 'Disabilitato'}
                </div>
                <div>
                  <strong>Alias Globali:</strong> {
                    (() => {
                      const aliases = selectedBucket.global_aliases;
                      console.log('🔍 INSPECT MODAL DEBUG - Processing global aliases:', {
                        aliases,
                        isArray: Array.isArray(aliases),
                        length: aliases?.length,
                        joined: aliases?.join?.(', ')
                      });
                      return aliases && Array.isArray(aliases) && aliases.length > 0 
                        ? aliases.join(', ') 
                        : 'Nessuno';
                    })()
                  }
                </div>
                <div>
                  <strong>Alias Locali:</strong> {
                    (() => {
                      const localAliases = selectedBucket.local_aliases;
                      console.log('🔍 INSPECT MODAL DEBUG - Processing local aliases:', {
                        localAliases,
                        isArray: Array.isArray(localAliases),
                        length: localAliases?.length
                      });
                      return localAliases && Array.isArray(localAliases) && localAliases.length > 0 
                        ? localAliases.map(alias => `${alias.access_key_id}: ${alias.alias}`).join(', ')
                        : 'Nessuno';
                    })()
                  }
                </div>
                <div>
                  <strong>Data Creazione:</strong> Non disponibile
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Oggetti nel Bucket</h3>
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    <span>{uploadingFile ? 'Caricamento...' : 'Carica File'}</span>
                  </button>
                </div>
              </div>
              {loadingObjects ? (
                <div className="text-center py-4">Caricamento oggetti...</div>
              ) : bucketObjects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Nessun oggetto nel bucket</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Dimensione</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ultima Modifica</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bucketObjects.map((obj) => (
                        <tr key={obj.key}>
                          <td className="border border-gray-300 px-4 py-2">{obj.key}</td>
                          <td className="border border-gray-300 px-4 py-2">{obj.size} bytes</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {formatDate(obj.last_modified)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleFileDownload(obj.key)}
                                disabled={downloadingFile === obj.key}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                title="Scarica file"
                              >
                                <Download size={14} />
                                <span>{downloadingFile === obj.key ? 'Scaricando...' : 'Scarica'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteObject(obj.key)}
                                className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                title="Elimina file"
                              >
                                <Trash2 size={14} />
                                <span>Elimina</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowInspectModal(false);
                  setSelectedBucket(null);
                  setBucketObjects([]);
                  setUploadingFile(false);
                  setDownloadingFile(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketsView;