from flask import Blueprint, request, jsonify
from models.candidate_model import Candidate
from .auth_routes import token_required
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'profiles')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

candidate_bp = Blueprint('candidates', __name__)

def allowed_file(filename):
    return '.'  in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@candidate_bp.route('/apply', methods=['POST'])
@token_required
def apply_as_candidate(current_user):
    """Apply to become a candidate with detailed information (or reactivate if previously revoked)"""
    try:
        # Extract user ID from dict or tuple (id, name, email, role, status)
        if isinstance(current_user, dict):
            current_user_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            current_user_id = current_user[0] if len(current_user) > 0 else None
        else:
            current_user_id = None
        if not current_user_id:
            return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401
        
        # Handle multipart form data (for file upload)
        data = request.form
        description = data.get('description', '')
        candidate_name = data.get('name', '')
        dob = data.get('dob', '')
        gender = data.get('gender', '')
        party = data.get('party', 'Independent')
        
        # Validation
        if not description:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Description is required'}}), 400
        
        if not candidate_name:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Name is required'}}), 400
        
        if not dob:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Date of birth is required'}}), 400
        
        if not gender:
            return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Gender is required'}}), 400
        
        # Handle profile picture upload
        profile_pic_path = None
        if 'profile_pic' in request.files:
            file = request.files['profile_pic']
            if file and file.filename and allowed_file(file.filename):
                # Create unique filename
                filename = secure_filename(f"{current_user_id}_{file.filename}")
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                # Store relative path
                profile_pic_path = f"/uploads/profiles/{filename}"
        
        # Check if user already has a candidate record (active or inactive)
        check_query = "SELECT id, is_active FROM candidates WHERE user_id = %s"
        from models import execute_query
        existing = execute_query(check_query, (current_user_id,), fetch_one=True)
        
        if existing:
            # User has a candidate record
            if isinstance(existing, dict):
                is_active = existing.get('is_active', False)
            elif isinstance(existing, (tuple, list)) and len(existing) > 1:
                is_active = existing[1]
            else:
                is_active = False
            
            if is_active:
                # Already an active candidate
                return jsonify({'error': {'code': 'ALREADY_CANDIDATE', 'message': 'You are already an active candidate'}}), 400
            else:
                # Reactivate the candidate with updated information
                candidate_id = Candidate.reactivate_candidacy(
                    current_user_id,
                    description,
                    candidate_name,
                    dob,
                    gender,
                    party,
                    profile_pic_path
                )
                
                if candidate_id is None:
                    return jsonify({'error': {'code': 'REACTIVATION_ERROR', 'message': 'Failed to reactivate candidacy'}}), 500
                
                return jsonify({
                    'message': 'Successfully reactivated your candidacy',
                    'candidate_id': candidate_id,
                    'reactivated': True
                }), 200
        else:
            # Create new candidate
            candidate_id = Candidate.create_from_user(
                current_user_id, 
                description,
                candidate_name,
                dob,
                gender,
                party,
                profile_pic_path
            )
            
            if candidate_id is None:
                return jsonify({'error': {'code': 'CREATE_ERROR', 'message': 'An error occurred while creating candidate'}}), 400
            
            return jsonify({
                'message': 'Successfully applied as a candidate',
                'candidate_id': candidate_id,
                'reactivated': False
            }), 201
    
    except Exception as e:
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@candidate_bp.route('/status', methods=['GET'])
@token_required
def get_candidate_status(current_user):
    """Check if user is a candidate"""
    try:
        # Extract user ID from dict or tuple (id, name, email, role, status)
        if isinstance(current_user, dict):
            current_user_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            current_user_id = current_user[0] if len(current_user) > 0 else None
        else:
            current_user_id = None
        if not current_user_id:
            return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401
        
        candidate = Candidate.get_by_user_id(current_user_id)
        
        if candidate is None:
            return jsonify({
                'is_candidate': False,
                'candidate': None
            }), 200
        
        # Handle different return types
        if isinstance(candidate, tuple):
            return jsonify({
                'is_candidate': True,
                'candidate': {
                    # Align with SELECT in Candidate.get_by_user_id
                    'id': candidate[0],
                    'name': candidate[1],
                    'party': candidate[2],
                    'position': candidate[3],
                    'user_id': candidate[4],
                    'description': candidate[5],
                    'is_active': candidate[6],
                    'dob': str(candidate[7]) if len(candidate) > 7 and candidate[7] else None,
                    'gender': candidate[8] if len(candidate) > 8 else None,
                    'profile_pic': candidate[9] if len(candidate) > 9 else None,
                    'created_at': str(candidate[10]) if len(candidate) > 10 and candidate[10] else None,
                    'user_name': candidate[11] if len(candidate) > 11 else None,
                    'email': candidate[12] if len(candidate) > 12 else None,
                    'vote_count': candidate[13] if len(candidate) > 13 else 0
                }
            }), 200
        elif isinstance(candidate, dict):
            return jsonify({
                'is_candidate': True,
                'candidate': candidate
            }), 200
        else:
            return jsonify({
                'is_candidate': False,
                'candidate': None
            }), 200
    
    except Exception as e:
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@candidate_bp.route('/votes', methods=['GET'])
@token_required
def get_vote_count(current_user):
    """Get vote count for current user as a candidate"""
    try:
        # Extract user ID from dict or tuple (id, name, email, role, status)
        if isinstance(current_user, dict):
            current_user_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            current_user_id = current_user[0] if len(current_user) > 0 else None
        else:
            current_user_id = None
        if not current_user_id:
            return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401
        
        vote_count = Candidate.get_vote_count(current_user_id)
        
        return jsonify({
            'vote_count': vote_count
        }), 200
    
    except Exception as e:
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@candidate_bp.route('/revoke', methods=['POST'])
@token_required
def revoke_candidacy(current_user):
    """Revoke candidate application"""
    try:
        # Extract user ID from dict or tuple (id, name, email, role, status)
        if isinstance(current_user, dict):
            current_user_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            current_user_id = current_user[0] if len(current_user) > 0 else None
        else:
            current_user_id = None
        if not current_user_id:
            return jsonify({'error': {'code': 'USER_CONTEXT_ERROR', 'message': 'Unable to resolve current user'}}), 401
        
        success = Candidate.revoke_candidacy(current_user_id)
        
        if not success:
            return jsonify({'error': {'code': 'NOT_CANDIDATE', 'message': 'You are not a candidate or already inactive'}}), 400
        
        return jsonify({
            'message': 'Candidacy revoked successfully'
        }), 200
    
    except Exception as e:
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e)}}), 500

@candidate_bp.route('/all', methods=['GET'])
def get_all_candidates():
    """Get all active candidates - Public endpoint, no vote counts shown"""
    try:
        print("DEBUG: Starting get_all_candidates()")
        candidates = Candidate.get_all()
        print(f"DEBUG: Got candidates: {candidates}")
        
        if candidates is None or not isinstance(candidates, (list, tuple)):
            print("DEBUG: No candidates or wrong type, returning empty list")
            return jsonify({'candidates': []}), 200
        
        # Format candidates WITHOUT vote counts (privacy protection)
        formatted_candidates = []
        for candidate in candidates:
            if isinstance(candidate, tuple):
                formatted_candidates.append({
                    'id': candidate[0],
                    'name': candidate[1],
                    'party': candidate[2] if len(candidate) > 2 else 'Independent',
                    'position': candidate[3] if len(candidate) > 3 else 'Candidate',
                    'user_id': candidate[4] if len(candidate) > 4 else None,
                    'description': candidate[5] if len(candidate) > 5 else '',
                    'is_active': candidate[6] if len(candidate) > 6 else True,
                    'dob': str(candidate[7]) if len(candidate) > 7 and candidate[7] else None,
                    'gender': candidate[8] if len(candidate) > 8 else None,
                    'profile_pic': candidate[9] if len(candidate) > 9 else None
                    # Note: vote_count removed for privacy - users only see their own in profile
                })
            elif isinstance(candidate, dict):
                # Remove vote_count if present in dict
                candidate_copy = candidate.copy()
                candidate_copy.pop('vote_count', None)
                formatted_candidates.append(candidate_copy)
        
        print(f"DEBUG: Returning {len(formatted_candidates)} formatted candidates")
        return jsonify({
            'candidates': formatted_candidates
        }), 200
    
    except Exception as e:
        print(f"ERROR in get_all_candidates: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@candidate_bp.route('', methods=['GET'])
def get_candidates_alias():
    """Alias for /all endpoint - Get all active candidates"""
    return get_all_candidates()


@candidate_bp.route('/results', methods=['GET'])
def get_results():
    """Get voting results with vote counts - Public endpoint after voting ends"""
    try:
        from models import execute_query
        from datetime import datetime
        
        # Check if voting has ended (after 8 PM)
        now = datetime.now()
        current_hour = now.hour
        is_finalized = current_hour >= 20 or current_hour < 8  # After 8 PM or before 8 AM
        
        # Get ALL candidates (including inactive) to check if winner revoked
        all_candidates_query = """
            SELECT c.id, c.name, c.party, c.position, c.description, c.profile_pic,
                   COUNT(v.id) as vote_count, c.is_active
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = CURRENT_DATE
            GROUP BY c.id, c.name, c.party, c.position, c.description, c.profile_pic, c.is_active
            ORDER BY vote_count DESC, c.name ASC
        """
        all_results = execute_query(all_candidates_query, fetch=True)
        
        # Get all candidates with their vote counts (only active for display)
        query = """
            SELECT c.id, c.name, c.party, c.position, c.description, c.profile_pic,
                   COUNT(v.id) as vote_count
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = CURRENT_DATE
            WHERE c.is_active = true
            GROUP BY c.id, c.name, c.party, c.position, c.description, c.profile_pic
            ORDER BY vote_count DESC, c.name ASC
        """
        results = execute_query(query, fetch=True)
        
        # Type guard: ensure results is a list/tuple, not None or int
        if not results or not isinstance(results, (list, tuple)):
            return jsonify({
                'results': [],
                'total_votes': 0,
                'total_candidates': 0,
                'is_finalized': is_finalized,
                'winner': None
            }), 200
        
        # Format results
        formatted_results = []
        total_votes = 0
        
        for result in results:
            # Type guard: ensure result is tuple or dict with proper length
            if isinstance(result, tuple) and len(result) >= 7:
                vote_count = int(result[6]) if result[6] is not None else 0
                formatted_results.append({
                    'id': result[0],
                    'name': result[1],
                    'party': result[2] if result[2] else 'Independent',
                    'position': result[3] if result[3] else 'Candidate',
                    'description': result[4] if result[4] else '',
                    'profile_pic': result[5] if result[5] else None,
                    'vote_count': vote_count
                })
                total_votes += vote_count
            elif isinstance(result, dict):
                vote_count = int(result.get('vote_count', 0))
                formatted_results.append({
                    'id': result.get('id'),
                    'name': result.get('name'),
                    'party': result.get('party', 'Independent'),
                    'position': result.get('position', 'Candidate'),
                    'description': result.get('description', ''),
                    'profile_pic': result.get('profile_pic'),
                    'vote_count': vote_count
                })
                total_votes += vote_count
        
        # Determine winner with tie-breaking if voting is finalized
        winner = None
        previous_winner_revoked = False
        revoked_winner_info = None
        
        if is_finalized:
            # Check if the candidate with most votes (from ALL candidates) has revoked
            if all_results and isinstance(all_results, (list, tuple)) and len(all_results) > 0:
                # Get the top candidate from all results (including inactive)
                top_all = all_results[0]
                if isinstance(top_all, tuple) and len(top_all) >= 8:
                    top_is_active = top_all[7]
                    top_vote_count = int(top_all[6]) if top_all[6] is not None else 0
                    
                    # If top candidate is inactive and has votes, they revoked after winning
                    if not top_is_active and top_vote_count > 0:
                        # Check if they would have been the winner (compare with current active candidates)
                        if formatted_results and top_vote_count >= formatted_results[0]['vote_count']:
                            previous_winner_revoked = True
                            revoked_winner_info = {
                                'name': top_all[1],
                                'vote_count': top_vote_count,
                                'party': top_all[2] if top_all[2] else 'Independent'
                            }
            
            # Determine winner from active candidates only
            if formatted_results:
                # Get candidates with highest vote count
                max_votes = formatted_results[0]['vote_count'] if formatted_results else 0
                top_candidates = [c for c in formatted_results if c['vote_count'] == max_votes]
                
                if len(top_candidates) == 1:
                    # Clear winner
                    winner = top_candidates[0]
                else:
                    # TIE-BREAKING RULES:
                    # 1. Alphabetical order by name (earliest alphabetically wins)
                    top_candidates.sort(key=lambda x: x['name'].lower())
                    winner = top_candidates[0]
                    winner['tie_broken'] = True
                    winner['tie_breaking_method'] = 'alphabetical'
                    winner['tied_candidates'] = [c['name'] for c in top_candidates]
        
        # Build voting status message
        if is_finalized:
            if previous_winner_revoked and revoked_winner_info:
                voting_status = f"Voting has ended for today. Original winner {revoked_winner_info['name']} ({revoked_winner_info['vote_count']} votes) withdrew from candidacy. Winner recalculated from remaining candidates."
            else:
                voting_status = 'Voting has ended for today. Results are final. Come back tomorrow for a new vote!'
        else:
            voting_status = 'Voting is currently in progress for today.'
        
        return jsonify({
            'results': formatted_results,
            'total_votes': total_votes,
            'total_candidates': len(formatted_results),
            'is_finalized': is_finalized,
            'winner': winner,
            'voting_status': voting_status,
            'previous_winner_revoked': previous_winner_revoked,
            'revoked_winner_info': revoked_winner_info
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
