% Types de crime
crime_type(assassinat).
crime_type(vol).
crime_type(escroquerie).

% Faits sur les suspects et les crimes
suspect(john).
suspect(mary).
suspect(alice).
suspect(bruno).
suspect(sophie).

% Faits pour le vol
has_motive(john, vol).
was_near_crime_scene(john, vol).
has_fingerprint_on_weapon(john, vol).

% Faits pour l_assassinat
has_motive(mary, assassinat).
was_near_crime_scene(mary, assassinat).
has_fingerprint_on_weapon(mary, assassinat).

% Faits pour l_escroquerie
has_motive(alice, escroquerie).
has_bank_transaction(alice, escroquerie).
has_motive(bruno, escroquerie).
has_bank_transaction(bruno, escroquerie).
has_motive(sophie, escroquerie).
owns_fake_identity(sophie, escroquerie).

% Règles pour déterminer la culpabilité
is_guilty(Suspect, vol) :-
    has_motive(Suspect, vol),
    was_near_crime_scene(Suspect, vol),
    has_fingerprint_on_weapon(Suspect, vol).
is_guilty(Suspect, assassinat) :-
    has_motive(Suspect, assassinat),
    was_near_crime_scene(Suspect, assassinat),
    has_fingerprint_on_weapon(Suspect, assassinat).
is_guilty(Suspect, escroquerie) :-
    has_motive(Suspect, escroquerie),
    (has_bank_transaction(Suspect, escroquerie) ; owns_fake_identity(Suspect, escroquerie)).
    
% Exemples de requêtes
% ?- is_guilty(mary, assassinat).
% ?- is_guilty(john, vol).
% ?- is_guilty(alice, escroquerie).
% ?- is_guilty(bruno, escroquerie).
% ?- is_guilty(sophie, escroquerie).
% ?- is_guilty(john, assassinat).